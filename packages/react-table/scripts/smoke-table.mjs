#!/usr/bin/env node
/**
 * Release gate: does the table survive a **production** build, and does its
 * stylesheet come with it?
 *
 * Two things can break here in a way that no unit test and no `vite dev` will
 * ever see, because both are consequences of bundling:
 *
 * 1. **The JS.** The table is two packages — a framework-free engine and a React
 *    adapter that re-exports from it. A wrong `sideEffects` or `exports` entry
 *    lets a bundler drop or fail to resolve half of it, and the build stays
 *    green while the component renders nothing.
 *
 * 2. **The CSS.** `@ui-organized/react-table/styles` resolves, through the
 *    adapter's `exports` map, to a file that physically lives in
 *    `@ui-organized/table-core/dist`. That indirection exists so a consumer
 *    imports one path rather than two — and it is exactly the kind of thing that
 *    silently resolves to an empty file. An unstyled table still renders, still
 *    passes every assertion about its markup, and is completely unusable.
 *
 * So: build `examples/table-smoke` — a real workspace app using the documented
 * setup and nothing else — then execute the built bundle and count what it
 * actually renders, and read the emitted stylesheet for rules that could only
 * have come from table-core.
 *
 * jsdom rather than a real browser, for the same reason
 * `packages/react/scripts/smoke-icons.mjs` uses it: the failure under test
 * happens at build time, and running the output only has to answer "did this
 * produce elements". No layout, no paint, nothing a CI runner has to download.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(pkgRoot));
const exampleDir = join(repoRoot, "examples", "table-smoke");
const distDir = join(exampleDir, "dist");

/** How many rows `src/main.jsx` renders. Kept in step deliberately. */
const EXPECTED_ROWS = 4;

let failures = 0;
const check = (name, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) failures++;
};

process.stdout.write("\nBuilding examples/table-smoke and everything it depends on…\n");

// The trailing `...` selects the example app *and its dependency closure* —
// both table packages, the component library, tokens and utils. Building only
// the app assumes something else already built those, and a gate that assumes
// another step ran first isn't a gate.
try {
  execFileSync("pnpm", ["--filter", "@ui-organized/example-table-smoke...", "build"], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
} catch (error) {
  process.stderr.write(
    `\n✗ Could not build the example app or its dependencies.\n\n${error.stderr || error.stdout || error.message}\n`,
  );
  process.exit(1);
}

check("the adapter built", existsSync(join(pkgRoot, "dist", "index.mjs")));
check("the example app builds", existsSync(join(distDir, "index.html")));

const html = await readFile(join(distDir, "index.html"), "utf8");

// ── The stylesheet ───────────────────────────────────────────────────────────
const assetsDir = join(distDir, "assets");
const cssFiles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((file) => file.endsWith(".css"))
  : [];
const css = (
  await Promise.all(cssFiles.map((file) => readFile(join(assetsDir, file), "utf8")))
).join("\n");

check("a stylesheet is emitted", cssFiles.length > 0, `${cssFiles.length} file(s)`);
check(
  "the table's own rules are in it",
  css.includes(".data-table__viewport") && css.includes(".data-table__head-cell"),
  "`@ui-organized/react-table/styles` must resolve through to table-core's dist/index.css",
);
check(
  "and they are token-driven, not baked",
  css.includes("var(--control-height-md)"),
  "a rule that survived bundling with its custom properties intact is one a theme can still reach",
);

// ── The markup ───────────────────────────────────────────────────────────────
const entry = /<script[^>]+src="([^"]+\.js)"/.exec(html)?.[1];
if (!entry) {
  process.stderr.write("\n✗ No module script found in the built index.html.\n\n");
  process.exit(1);
}

const { JSDOM } = await import("jsdom");
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost/",
  pretendToBeVisual: true,
});

const noise = [];
// `defineProperty` rather than assignment: Node >= 21 defines a getter-only
// `globalThis.navigator`, so a plain assignment throws.
const defineGlobal = (name, value) =>
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });

defineGlobal("window", dom.window);
defineGlobal("document", dom.window.document);
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in globalThis) continue;
  const value = dom.window[key];
  if (typeof value === "function" || (value && typeof value === "object")) defineGlobal(key, value);
}
defineGlobal("navigator", dom.window.navigator);
defineGlobal("requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0));
defineGlobal("cancelAnimationFrame", clearTimeout);
// The virtualizer and the responsive watcher both construct one; jsdom has none.
defineGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

const realWarn = console.warn;
const realError = console.error;
console.warn = (...args) => noise.push(args.join(" "));
console.error = (...args) => noise.push(args.join(" "));

try {
  await import(pathToFileURL(join(distDir, entry.replace(/^\//, ""))).href);
  await new Promise((resolve) => setTimeout(resolve, 50));

  const doc = dom.window.document;
  const table = doc.querySelector("table");
  const rows = doc.querySelectorAll("tbody tr").length;

  check("the table renders in the production build", Boolean(table));
  check("every row survives", rows === EXPECTED_ROWS, `${rows} of ${EXPECTED_ROWS}`);
  check(
    "it is a real table with a name",
    doc.querySelector("caption")?.textContent === "Team members",
  );
  check(
    "row headers survive",
    doc.querySelectorAll('tbody th[scope="row"]').length === EXPECTED_ROWS,
  );
  check(
    "the grid role and the row positions survive",
    table?.getAttribute("role") === "grid" &&
      table?.getAttribute("aria-rowcount") === String(EXPECTED_ROWS + 1),
  );
  check(
    "the selection column composes with the component library",
    doc.querySelectorAll('tbody input[type="checkbox"]').length === EXPECTED_ROWS,
    "a dropped @ui-organized/react peer shows up here first",
  );
} catch (error) {
  console.warn = realWarn;
  console.error = realError;
  process.stderr.write(`\n✗ The built bundle threw when executed.\n\n${error.stack}\n`);
  process.exit(1);
} finally {
  console.warn = realWarn;
  console.error = realError;
}

if (noise.length) {
  process.stdout.write(`\n  Console output while rendering:\n`);
  for (const line of noise) process.stdout.write(`    ${line.split("\n")[0]}\n`);
}

process.stdout.write(
  failures === 0
    ? "\n✓ table smoke passed\n\n"
    : `\n✗ table smoke failed — ${failures} check(s)\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
