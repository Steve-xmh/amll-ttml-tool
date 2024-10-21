/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly TAURI_ENV_DEBUG?: string
    readonly TAURI_ENV_TARGET_TRIPLE?: string
    readonly TAURI_ENV_ARCH?: string
    readonly TAURI_ENV_PLATFORM?: string
    readonly TAURI_ENV_FAMILY?: string
    // 更多环境变量...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
