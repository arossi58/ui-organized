/**
 * Copies the shared stylesheet so `@ui-organized/angular/styles.css` resolves,
 * both in this workspace and in a published install.
 *
 * Two copies, one manifest entry. ng-packagr publishes `dist/` as the package
 * root, so the manifest has to say `./styles.css` — but a workspace consumer
 * resolves through the symlink to the *package* root, where that same string
 * has to mean something too. Writing both makes one entry correct in both
 * places; rewriting the path per environment would not.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = join(dirname(require.resolve("@ui-organized/core/package.json")), "dist/styles.css");

mkdirSync("dist", { recursive: true });
copyFileSync(source, "styles.css");
copyFileSync(source, "dist/styles.css");
console.log("copy-styles: styles.css, dist/styles.css");
