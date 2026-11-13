/**
 * Publish the whole-stylesheet convenience entry.
 *
 * It is optional. Each component imports its own CSS from @ui-organized/core,
 * and the package entry imports the typography and base rules they share, so a
 * bundler that drops the components an app doesn't use drops their stylesheets
 * with them. This is the other door: one file, every component, in core's
 * cascade order, for consumers who would rather import everything once,
 * mirroring `@ui-organized/react/styles.css`. It is core's bundle, copied — not
 * a second concatenation that could fall out of step with it.
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
