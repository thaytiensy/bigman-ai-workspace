use crate::cloud_export::{package_and_encrypt_for_cloud, CLOUD_SYNC_ENDPOINT};
use crate::models::{Bot, EncryptedSyncPackage, MemoryItem, QuotaStatus, Room};
use crate::quota::{BRAND_EMAIL, BRAND_NAME, BRAND_ZALO};
use crate::storage::Storage;
use serde_json::json;
use tauri::State;

#[tauri::command]
pub fn get_quota_status(storage: State<Storage>) -> Result<QuotaStatus, String> {
    storage
        .get_quota_status()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn activate_license_key(storage: State<Storage>, key: String) -> Result<QuotaStatus, String> {
    storage
        .activate_desktop_pro(&key)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_bots(storage: State<Storage>) -> Result<Vec<Bot>, String> {
    storage
        .list_bots()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_bot(storage: State<Storage>, bot: Bot) -> Result<(), String> {
    storage
        .save_bot(&bot)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_bot_active(storage: State<Storage>, bot_id: String, active: bool) -> Result<(), String> {
    storage
        .set_bot_active(&bot_id, active)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_rooms(storage: State<Storage>) -> Result<Vec<Room>, String> {
    storage
        .list_rooms()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_room(storage: State<Storage>, room: Room) -> Result<(), String> {
    storage
        .create_room(&room)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_memories(storage: State<Storage>, bot_id: Option<String>) -> Result<Vec<MemoryItem>, String> {
    storage
        .list_memories(bot_id.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_memory(storage: State<Storage>, item: MemoryItem) -> Result<(), String> {
    storage
        .save_memory(&item)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_cloud_sync_package(
    storage: State<Storage>,
    passphrase: Option<String>,
) -> Result<EncryptedSyncPackage, String> {
    package_and_encrypt_for_cloud(&storage, passphrase.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_system_info(storage: State<Storage>) -> Result<serde_json::Value, String> {
    let quota = storage.get_quota_status().map_err(|e| e.to_string())?;
    Ok(json!({
        "brand": BRAND_NAME,
        "contact_zalo": BRAND_ZALO,
        "contact_email": BRAND_EMAIL,
        "version": "1.0.0",
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "machine_id": storage.machine_id,
        "quota": quota,
        "cloud_sync_endpoint": CLOUD_SYNC_ENDPOINT
    }))
}
