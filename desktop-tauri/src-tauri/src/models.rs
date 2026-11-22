use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Lỗi cơ sở dữ liệu SQLite: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Lỗi mã hóa dữ liệu AES-256-GCM: {0}")]
    Crypto(String),

    #[error("Vượt quá hạn mức bản Desktop Free: Đã kích hoạt {current}/{max} Bot. Vui lòng nâng cấp Desktop Pro (1.890.000đ/máy) hoặc lên Web SaaS Cloud để mở khóa.")]
    BotQuotaExceeded { current: usize, max: usize },

    #[error("Vượt quá hạn mức bản Desktop Free: Đã tạo {current}/{max} Phòng họp. Vui lòng nâng cấp Desktop Pro hoặc gói Cloud.")]
    RoomQuotaExceeded { current: usize, max: usize },

    #[error("Mã bản quyền Desktop Pro không hợp lệ hoặc không khớp với mã phần cứng máy tính.")]
    InvalidLicenseKey,

    #[error("Không tìm thấy dữ liệu: {0}")]
    NotFound(String),

    #[error("Lỗi I/O hoặc hệ thống: {0}")]
    Io(#[from] std::io::Error),

    #[error("Lỗi tuần tự hóa JSON: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AppTier {
    DesktopFree,
    DesktopPro,
    CloudStarter,
    CloudPro,
    CloudBusiness,
}

impl std::fmt::Display for AppTier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppTier::DesktopFree => write!(f, "Bản Cài Máy Miễn Phí (Desktop Free)"),
            AppTier::DesktopPro => write!(f, "Bản Desktop Pro Bản Quyền (1.890.000đ/máy)"),
            AppTier::CloudStarter => write!(f, "Gói Cloud Starter (199k-349k/tháng)"),
            AppTier::CloudPro => write!(f, "Gói Pro Team Cloud (499k-799k/tháng)"),
            AppTier::CloudBusiness => write!(f, "Gói Business Cloud (1.290k-1.990k/tháng)"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaStatus {
    pub brand: String,
    pub tier: AppTier,
    pub tier_name: String,
    pub max_active_bots: usize,
    pub current_active_bots: usize,
    pub total_bots_configured: usize,
    pub max_rooms: usize,
    pub current_rooms: usize,
    pub is_pro_licensed: bool,
    pub license_key_masked: Option<String>,
    pub machine_id: String,
    pub can_run_background_daemon_247: bool,
    pub contact_zalo: String,
    pub contact_email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bot {
    pub id: String,
    pub name: String,
    pub role: String,
    pub department: String,
    pub avatar: String,
    pub system_prompt: String,
    pub model: String,
    pub is_active: bool,
    pub is_template: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    pub id: String,
    pub name: String,
    pub description: String,
    pub member_bot_ids: Vec<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryItem {
    pub id: String,
    pub bot_id: Option<String>,
    pub memory_key: String,
    pub content: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseRecord {
    pub id: String,
    pub license_key: String,
    pub tier: AppTier,
    pub machine_id: String,
    pub activated_at: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudExportPlaintext {
    pub schema_version: String,
    pub brand: String,
    pub exported_at: String,
    pub machine_id: String,
    pub tier: AppTier,
    pub bots: Vec<Bot>,
    pub rooms: Vec<Room>,
    pub memories: Vec<MemoryItem>,
    pub contact: CloudExportContact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudExportContact {
    pub hotline_zalo: String,
    pub official_email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedSyncPackage {
    pub brand: String,
    pub schema_version: String,
    pub algorithm: String,
    pub nonce_base64: String,
    pub ciphertext_base64: String,
    pub checksum_sha256: String,
    pub exported_at: String,
    pub machine_id_hash: String,
    pub summary_bots_count: usize,
    pub summary_rooms_count: usize,
    pub summary_memories_count: usize,
}
