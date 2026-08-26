/**
 * Copy the raw component stylesheets into `dist/` so they can be imported one
 * at a time.
 *
 * The framework packages do `import "@ui-organized/core/components/Button/Button.css"`
 * rather than pulling the whole bundle, which is what keeps a consumer who uses
 * three components from shipping all sixty-five stylesheets. That needs the
 * files to exist individually under `dist/`, mirroring `src/`, and no bundler
 * will put them there — hence this script.
 *
 * Runs after tsup, which owns `clean`, so this must not run before it.
 */
import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = join(root, "dist");

async function* cssFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* cssFiles(full);
    else if (entry.name.endsWith(".css")) yield full;
  }
}

let copied = 0;
for await (const file of cssFiles(src)) {
  const target = join(dist, relative(src, file));
  await mkdir(dirname(target), { recursive: true });
  await cp(file, target);
  copied += 1;
}

console.log(`build-css: copied ${copied} stylesheet${copied === 1 ? "" : "s"} to dist/`);
