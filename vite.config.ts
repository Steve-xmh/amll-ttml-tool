import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { type Plugin, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import svgLoader from "vite-svg-loader";

const plugins: Plugin[] = [
	react({
		babel: {
			plugins: [jotaiDebugLabel, jotaiReactRefresh],
		},
	}),
	svgLoader(),
	wasm(),
	topLevelAwait(),
	VitePWA({
		injectRegister: null,
		disable: !!process.env.TAURI_PLATFORM || !process.env.VITE_DEV,
		workbox: {
			globPatterns: ["**/*.{js,css,html,wasm}", "kuromoji-dict-min/*.dat"],
			maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
		},
		manifest: {
			name: "Apple Music-like lyrics TTML Tool",
			id: "amll-ttml-tool",
			short_name: "AMLL TTML Tool",
			description: "一个用于 Apple Music 的逐词歌词 TTML 编辑和时间轴工具",
			theme_color: "#18a058",
			icons: [
				{
					src: "./icons/Square30x30Logo.png",
					sizes: "30x30",
					type: "image/png",
				},
				{
					src: "./icons/Square44x44Logo.png",
					sizes: "44x44",
					type: "image/png",
				},
				{
					src: "./icons/Square71x71Logo.png",
					sizes: "71x71",
					type: "image/png",
				},
				{
					src: "./icons/Square89x89Logo.png",
					sizes: "89x89",
					type: "image/png",
				},
				{
					src: "./icons/Square107x107Logo.png",
					sizes: "107x107",
					type: "image/png",
				},
				{
					src: "./logo.png",
					sizes: "1024x1024",
					type: "image/png",
				},
				{
					src: "./logo.svg",
					sizes: "128x128",
					type: "image/svg",
				},
			],
		},
	}),
];

// https://vitejs.dev/config/
export default defineConfig({
	plugins,
	base: process.env.TAURI_ENV_PLATFORM ? "/" : "./",
	clearScreen: false,
	server: {
		strictPort: true,
	},
	envPrefix: ["VITE_", "TAURI_"],
	build: {
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target:
			process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
		// don't minify for debug builds
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
	worker: {
		format: "es",
	},
});
