/**
 * Publish the whole-stylesheet convenience entry — core's bundle, copied.
 *
 * Individual components import their own CSS from @ui-organized/core, so an app
 * only ships the stylesheets for what it uses. This is the other door, mirroring
 * `@ui-organized/react/styles`, and it is a copy rather than a second
 * concatenation that could fall out of step.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const source = join(dirname(require.resolve("@ui-organized/core/package.json")), "dist/styles.css");
const target = join(root, "dist/styles.css");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log("copy-styles: dist/styles.css");
