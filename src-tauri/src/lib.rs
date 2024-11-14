use tao::rwh_06::HasWindowHandle;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // #[cfg(target_os = "windows")]
            // if let Some(win) = app.get_webview_window("main") {
            //     if window_vibrancy::apply_tabbed(&win, None).is_err()
            //         && window_vibrancy::apply_mica(&win, None).is_err()
            //     {
            //         let _ = window_vibrancy::apply_acrylic(&win, None);
            //     }
            // }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
