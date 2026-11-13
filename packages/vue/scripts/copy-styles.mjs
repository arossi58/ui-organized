/**
 * Publish the whole-stylesheet convenience entry — core's bundle, copied.
 *
 * It is optional. Each component module imports its own CSS from
 * @ui-organized/core (the build keeps one output module per source module so
 * the import stays beside its component), and the package entry imports the
 * typography and base rules they share, so a bundler that drops the components
 * an app doesn't use drops their stylesheets with them. This is the other door:
 * one file, every component, in core's cascade order, mirroring
 * `@ui-organized/react/styles.css`. It is a copy rather than a second
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
