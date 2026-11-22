use crate::models::{
    AppError, CloudExportContact, CloudExportPlaintext, EncryptedSyncPackage,
};
use crate::quota::{BRAND_EMAIL, BRAND_NAME, BRAND_ZALO};
use crate::storage::Storage;
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rand::RngCore;
use sha2::{Digest, Sha256};

pub const SYNC_SCHEMA_VERSION: &str = "1.0.0";
pub const SYNC_ALGORITHM: &str = "AES-256-GCM";
/// Endpoint chính thức đồng bộ 1 chạm từ Bản Cài Máy (Desktop) lên Cloud Backend
pub const CLOUD_SYNC_ENDPOINT: &str = "/api/v1/migration/desktop-import";

/// Chuẩn bị và trích xuất dữ liệu thô toàn bộ Workspace Desktop
pub fn build_plaintext_export(storage: &Storage) -> Result<CloudExportPlaintext, AppError> {
    let tier = storage.get_tier()?;
    let bots = storage.list_bots()?;
    let rooms = storage.list_rooms()?;
    let memories = storage.list_memories(None)?;

    let now = chrono::Utc::now().to_rfc3339();

    Ok(CloudExportPlaintext {
        schema_version: SYNC_SCHEMA_VERSION.to_string(),
        brand: BRAND_NAME.to_string(),
        exported_at: now,
        machine_id: storage.machine_id.clone(),
        tier,
        bots,
        rooms,
        memories,
        contact: CloudExportContact {
            hotline_zalo: BRAND_ZALO.to_string(),
            official_email: BRAND_EMAIL.to_string(),
        },
    })
}

/// Tạo khóa AES-256 từ mật mã chuyển giao hoặc salt phần cứng
fn derive_aes256_key(passphrase: Option<&str>, machine_id: &str) -> [u8; 32] {
    let input = match passphrase {
        Some(pass) if !pass.trim().is_empty() => {
            format!("{}:{}:TNVA_CLOUD_TRANSFER_KEY_V2", pass.trim(), machine_id)
        }
        _ => {
            format!("{}:TNVA_DEFAULT_DEVICE_SYNC_SECRET_2026", machine_id)
        }
    };

    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result[0..32]);
    key
}

/// Đóng gói và mã hóa hồ sơ bot + bộ nhớ cục bộ bằng AES-256-GCM
pub fn package_and_encrypt_for_cloud(
    storage: &Storage,
    passphrase: Option<&str>,
) -> Result<EncryptedSyncPackage, AppError> {
    let plaintext_obj = build_plaintext_export(storage)?;
    let plaintext_json = serde_json::to_string(&plaintext_obj)?;

    // Tính checksum SHA-256 của plaintext để Cloud kiểm tra toàn vẹn
    let mut hasher = Sha256::new();
    hasher.update(plaintext_json.as_bytes());
    let checksum_sha256 = format!("{:X}", hasher.finalize());

    // Sinh 96-bit (12-byte) nonce ngẫu nhiên
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Dẫn xuất khóa 256-bit và thực hiện mã hóa
    let key_bytes = derive_aes256_key(passphrase, &storage.machine_id);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AppError::Crypto(format!("Không thể khởi tạo Cipher AES-256: {}", e)))?;

    let ciphertext = cipher
        .encrypt(nonce, plaintext_json.as_bytes())
        .map_err(|e| AppError::Crypto(format!("Lỗi mã hóa dữ liệu AES-256-GCM: {}", e)))?;

    // Tính băm Machine ID để đối chiếu bảo mật
    let mut mid_hasher = Sha256::new();
    mid_hasher.update(storage.machine_id.as_bytes());
    let machine_id_hash = format!("{:X}", mid_hasher.finalize())[0..16].to_string();

    Ok(EncryptedSyncPackage {
        brand: BRAND_NAME.to_string(),
        schema_version: SYNC_SCHEMA_VERSION.to_string(),
        algorithm: SYNC_ALGORITHM.to_string(),
        nonce_base64: BASE64.encode(nonce_bytes),
        ciphertext_base64: BASE64.encode(ciphertext),
        checksum_sha256,
        exported_at: plaintext_obj.exported_at,
        machine_id_hash,
        summary_bots_count: plaintext_obj.bots.len(),
        summary_rooms_count: plaintext_obj.rooms.len(),
        summary_memories_count: plaintext_obj.memories.len(),
    })
}

/// Giải mã gói đồng bộ đám mây (dùng để kiểm thử hai chiều và khôi phục)
pub fn decrypt_cloud_package(
    package: &EncryptedSyncPackage,
    passphrase: Option<&str>,
    machine_id: &str,
) -> Result<CloudExportPlaintext, AppError> {
    let nonce_bytes = BASE64
        .decode(&package.nonce_base64)
        .map_err(|e| AppError::Crypto(format!("Lỗi giải mã Base64 Nonce: {}", e)))?;
    let ciphertext = BASE64
        .decode(&package.ciphertext_base64)
        .map_err(|e| AppError::Crypto(format!("Lỗi giải mã Base64 Ciphertext: {}", e)))?;

    if nonce_bytes.len() != 12 {
        return Err(AppError::Crypto("Kích thước Nonce không hợp lệ (phải là 12 bytes)".to_string()));
    }

    let nonce = Nonce::from_slice(&nonce_bytes);
    let key_bytes = derive_aes256_key(passphrase, machine_id);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| AppError::Crypto(format!("Không thể tạo Cipher giải mã: {}", e)))?;

    let decrypted_bytes = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| AppError::Crypto(format!("Giải mã thất bại: Mật mã hoặc khóa không hợp lệ ({})", e)))?;

    let decrypted_json = String::from_utf8(decrypted_bytes)
        .map_err(|e| AppError::Crypto(format!("Dữ liệu giải mã không phải chuỗi UTF-8 hợp lệ: {}", e)))?;

    // Đối chiếu Checksum SHA-256
    let mut hasher = Sha256::new();
    hasher.update(decrypted_json.as_bytes());
    let computed_checksum = format!("{:X}", hasher.finalize());

    if computed_checksum != package.checksum_sha256 {
        return Err(AppError::Crypto(
            "Checksum SHA-256 không khớp! Gói dữ liệu có thể đã bị chỉnh sửa hoặc hư hại.".to_string(),
        ));
    }

    let plaintext_obj: CloudExportPlaintext = serde_json::from_str(&decrypted_json)?;
    Ok(plaintext_obj)
}
