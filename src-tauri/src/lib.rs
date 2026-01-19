#[derive(serde::Serialize)]
struct OpenFileData {
    pub filename: String,
    pub data: String,
    pub ext: String,
}

#[tauri::command]
fn get_open_file_data() -> Option<OpenFileData> {
    let filename = std::env::args().nth(1);
    if let Some(filename) = filename {
        let path = std::path::Path::new(&filename);
        let ext = path
            .extension()
            .map(|x| x.to_string_lossy().into_owned())
            .unwrap_or_default();
        if let Ok(data) = std::fs::read_to_string(&filename) {
            return Some(OpenFileData {
                filename,
                data,
                ext,
            });
        }
    }

    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(clippy::missing_panics_doc)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_decorum::init())
        .plugin(tauri_plugin_process::init());

    #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            #[cfg(target_os = "macos")]
            {
                use tao::rwh_06::HasWindowHandle;
                use tauri::Manager;
                use tauri_plugin_decorum::WebviewWindowExt;

                let main_window = app.get_webview_window("main").unwrap();
                main_window.set_traffic_lights_inset(16.0, 20.0).unwrap();
                main_window.make_transparent().unwrap();
                let main_window_clone = main_window.clone();
                main_window.on_window_event(move |evt| {
                    if let tauri::WindowEvent::Resized(_) = evt {
                        main_window_clone
                            .set_traffic_lights_inset(16.0, 20.0)
                            .unwrap();
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_open_file_data,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
