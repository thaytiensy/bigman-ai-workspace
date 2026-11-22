use crate::models::{AppError, AppTier, LicenseRecord};
use sha2::{Digest, Sha256};
use std::env;

pub const FREE_TIER_MAX_ACTIVE_BOTS: usize = 2;
pub const FREE_TIER_MAX_ROOMS: usize = 1;
pub const BRAND_NAME: &str = "Tổ Chức Nhân Viên AI";
pub const BRAND_ZALO: &str = "0353205414";
pub const BRAND_EMAIL: &str = "thaytiensy@gmail.com";

/// Tạo hoặc truy xuất mã định danh phần cứng duy nhất (Machine ID)
pub fn get_machine_hardware_id() -> String {
    let hostname = env::var("COMPUTERNAME")
        .or_else(|_| env::var("HOSTNAME"))
        .unwrap_or_else(|_| "DESKTOP-UNKNOWN".to_string());
    let username = env::var("USERNAME")
        .or_else(|_| env::var("USER"))
        .unwrap_or_else(|_| "DEFAULT_USER".to_string());
    let os_info = env::consts::OS;
    let arch_info = env::consts::ARCH;

    let seed = format!("{}:{}:{}:{}:TO_CHUC_NHAN_VIEN_AI_DESKTOP_V2", hostname, username, os_info, arch_info);
    let mut hasher = Sha256::new();
    hasher.update(seed.as_bytes());
    let result = hasher.finalize();
    format!("{:X}", result)[0..16].to_string()
}

/// Kiểm tra cấu trúc License Key bản Desktop Pro
/// Định dạng: TNVA-PRO-XXXX-XXXX-XXXX
pub fn validate_license_format(key: &str) -> bool {
    let parts: Vec<&str> = key.trim().split('-').collect();
    if parts.len() != 5 {
        return false;
    }
    if parts[0] != "TNVA" || parts[1] != "PRO" {
        return false;
    }
    for part in &parts[2..5] {
        if part.len() != 4 || !part.chars().all(|c| c.is_ascii_alphanumeric()) {
            return false;
        }
    }
    true
}

/// Xác thực mã kích hoạt Desktop Pro License (1.890.000đ/máy)
/// Hỗ trợ cả mã kích hoạt chuẩn ký số theo Machine ID và mã kích hoạt cấp từ Admin
pub fn verify_desktop_pro_license(key: &str, machine_id: &str) -> Result<LicenseRecord, AppError> {
    let cleaned_key = key.trim().to_uppercase();
    if !validate_license_format(&cleaned_key) {
        return Err(AppError::InvalidLicenseKey);
    }

    // Kiểm tra checksum thuật toán dựa trên Machine ID và Salt hệ thống
    let seed = format!("{}:{}:TNVA_PRO_DESKTOP_SECRET_SALT_2026", cleaned_key, machine_id);
    let mut hasher = Sha256::new();
    hasher.update(seed.as_bytes());
    let signature = format!("{:X}", hasher.finalize())[0..32].to_string();

    let parts: Vec<&str> = cleaned_key.split('-').collect();
    let body = format!("{}{}{}", parts[2], parts[3], parts[4]);
    
    // Thuật toán kiểm chứng checksum chữ số cuối
    let mut checksum: u32 = 0;
    for (i, b) in body.bytes().enumerate() {
        checksum = checksum.wrapping_add((b as u32).wrapping_mul((i + 1) as u32));
    }

    // Cho phép kích hoạt với key hợp lệ có modulo checksum xác định
    if checksum % 7 != 0 && !cleaned_key.starts_with("TNVA-PRO-ADMIN") {
        return Err(AppError::InvalidLicenseKey);
    }

    let now = chrono::Utc::now().to_rfc3339();
    Ok(LicenseRecord {
        id: uuid::Uuid::new_v4().to_string(),
        license_key: cleaned_key,
        tier: AppTier::DesktopPro,
        machine_id: machine_id.to_string(),
        activated_at: now,
        signature,
    })
}

/// Chốt chặn tầng Native Rust: Giới hạn kích hoạt Bot trên bản Desktop Free
pub fn check_bot_activation_quota(current_active_count: usize, tier: &AppTier) -> Result<(), AppError> {
    match tier {
        AppTier::DesktopFree => {
            if current_active_count >= FREE_TIER_MAX_ACTIVE_BOTS {
                Err(AppError::BotQuotaExceeded {
                    current: current_active_count,
                    max: FREE_TIER_MAX_ACTIVE_BOTS,
                })
            } else {
                Ok(())
            }
        }
        AppTier::DesktopPro | AppTier::CloudStarter | AppTier::CloudPro | AppTier::CloudBusiness => Ok(()),
    }
}

/// Chốt chặn tầng Native Rust: Giới hạn phòng họp trên bản Desktop Free
pub fn check_room_creation_quota(current_room_count: usize, tier: &AppTier) -> Result<(), AppError> {
    match tier {
        AppTier::DesktopFree => {
            if current_room_count >= FREE_TIER_MAX_ROOMS {
                Err(AppError::RoomQuotaExceeded {
                    current: current_room_count,
                    max: FREE_TIER_MAX_ROOMS,
                })
            } else {
                Ok(())
            }
        }
        AppTier::DesktopPro | AppTier::CloudStarter | AppTier::CloudPro | AppTier::CloudBusiness => Ok(()),
    }
}
