/**
 * Publish `@ui-organized/vue-table/styles` — table-core's stylesheet, copied.
 *
 * `@ui-organized/react-table` gets this for free: tsup pulls the CSS subpath
 * back in with `noExternal` while leaving the JS external, so one bundle carries
 * both. Vite has no equivalent — a CSS import from an externalised package is
 * left as an import rather than inlined — so the file is copied instead, which
 * is what `@ui-organized/angular` and `@ui-organized/vue` already do for core's
 * bundle and for the same reason.
 *
 * A copy rather than a second concatenation that could fall out of step: the
 * source of truth is `@ui-organized/table-core/dist/index.css`, built from the
 * same stylesheets the React table ships.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const source = join(
  dirname(require.resolve("@ui-organized/table-core/package.json")),
  "dist/index.css",
);
const target = join(root, "dist/styles.css");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log("copy-styles: dist/styles.css");
