import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * create-vite's svelte-ts template, unchanged. svelte-check reads this file;
 * without it, it goes looking in vite.config.js and gives up.
 */
export default { preprocess: vitePreprocess() };
