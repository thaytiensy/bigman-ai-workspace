pub mod cloud_export;
pub mod commands;
pub mod models;
pub mod quota;
pub mod storage;

use commands::*;
use storage::Storage;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let storage = match Storage::new() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Khởi động cơ sở dữ liệu SQLite thất bại: {}", e);
            std::process::exit(1);
        }
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .manage(storage)
        .setup(|app| {
            // Thiết lập System Tray menu tiếng Việt chuẩn thương hiệu Tổ Chức Nhân Viên AI
            let show_item =
                MenuItem::with_id(app, "show", "Mở Tổ Chức Nhân Viên AI", true, None::<&str>)?;
            let status_item = MenuItem::with_id(
                app,
                "status",
                "Hạn mức: Tối đa 2 Bot (Bản Cài Máy 0đ)",
                true,
                None::<&str>,
            )?;
            let cloud_item = MenuItem::with_id(
                app,
                "cloud",
                "Nâng cấp Cloud 24/7 (Zalo: 0353205414)",
                true,
                None::<&str>,
            )?;
            let quit_item = MenuItem::with_id(app, "quit", "Thoát ứng dụng", true, None::<&str>)?;

            let menu =
                Menu::with_items(app, &[&show_item, &status_item, &cloud_item, &quit_item])?;

            let mut tray_builder = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Tổ Chức Nhân Viên AI - Hệ Thống Nhân Viên AI Đa Bot")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                });

            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }

            let _tray = tray_builder.build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_quota_status,
            activate_license_key,
            list_bots,
            save_bot,
            set_bot_active,
            list_rooms,
            create_room,
            list_memories,
            save_memory,
            export_cloud_sync_package,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("Lỗi trong quá trình khởi chạy ứng dụng Tauri Tổ Chức Nhân Viên AI");
}
