import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: '/m3309-topalo/',
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				blog: resolve(__dirname, "blog.html"),
				catalog: resolve(__dirname, "catalog.html"),
				about: resolve(__dirname, "about.html"),
			},
		},
	},
});
