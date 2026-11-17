import vue from "@vitejs/plugin-vue";

/**
 * Deliberately default settings — no `treeshake` overrides, no aliases.
 * The point of this app is to be built exactly the way a consumer's would be.
 */
export default { plugins: [vue()], logLevel: "error" };
