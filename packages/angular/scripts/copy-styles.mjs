/**
 * Copies the shared stylesheet into `dist/` so consumers can import
 * `@ui-organized/angular/styles.css` rather than reaching into another package.
 *
 * The same three lines the Svelte and Vue packages run, for the same reason:
 * one stylesheet, four libraries, and a consumer who should not have to know
 * that `@ui-organized/core` exists.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const core = dirname(require.resolve("@ui-organized/core/package.json"));

mkdirSync("dist", { recursive: true });
copyFileSync(join(core, "dist/styles.css"), "dist/styles.css");
console.log("copy-styles: dist/styles.css");
