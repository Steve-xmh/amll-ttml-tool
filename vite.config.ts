import { defineConfig, type UserConfig } from "vite";
import svgLoader from "vite-svg-loader";
import vue from "@vitejs/plugin-vue";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { VitePWA } from "vite-plugin-pwa";

const plugins = [
	vue(),
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

const rollupOptions: UserConfig["build"]["rollupOptions"] = {
	output: {
		manualChunks(id) {
			if (id.includes("naive-ui")) {
				return "naive-ui";
			} if (id.includes("@pixi")) {
				return "pixi";
			} else if (id.includes("node_modules")) {
				return "vendor";
			}
		},
	},
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins,
	base: process.env.TAURI_PLATFORM ? "/" : "./",

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// prevent vite from obscuring rust errors
	clearScreen: false,
	// tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
	},
	// to make use of `TAURI_DEBUG` and other env variables
	// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ["VITE_", "TAURI_"],
	build: process.env.TAURI_PLATFORM
		? {
				// Tauri supports es2021
				target:
					process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
				// don't minify for debug builds
				minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
				// produce sourcemaps for debug builds
				sourcemap: !!process.env.TAURI_DEBUG,
				rollupOptions,
		  }
		: {
				rollupOptions,
		  },
});
