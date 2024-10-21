use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            if let Some(win) = app.get_webview_window("main") {
                #[cfg(target_os = "windows")]
                if window_vibrancy::apply_tabbed(&win, None).is_err()
                    && window_vibrancy::apply_mica(&win, None).is_err()
                {
                    let _ = window_vibrancy::apply_acrylic(&win, None);
                }
                #[cfg(target_os = "macos")]
                let _ = window_vibrancy::apply_vibrancy(
                    &win,
                    window_vibrancy::NSVisualEffectMaterial::HudWindow,
                    None,
                    None,
                );
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
