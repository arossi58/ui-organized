#!/usr/bin/env node
/**
 * Release gate for all four data tables: does the table survive a **production**
 * build, and does its stylesheet come with it?
 *
 * Usage: `node scripts/smoke-table.mjs <framework>` where framework is one of
 * `react`, `vue`, `svelte`, `angular`.
 *
 * ── What only a build can break ─────────────────────────────────────────────
 *
 * Two things fail here in a way that no unit test and no `vite dev` will ever
 * see, because both are consequences of bundling:
 *
 * 1. **The JS.** Each table is two packages — a framework-free engine and an
 *    adapter that re-exports from it. A wrong `sideEffects` or `exports` entry
 *    lets a bundler drop or fail to resolve half of it, and the build stays
 *    green while the component renders nothing.
 *
 * 2. **The CSS.** `@ui-organized/<fw>-table/styles` resolves, through the
 *    adapter's `exports` map, to a file that physically lives in
 *    `@ui-organized/table-core/dist`. That indirection exists so a consumer
 *    imports one path rather than two — and it is exactly the kind of thing that
 *    silently resolves to an empty file. An unstyled table still renders, still
 *    passes every assertion about its markup, and is completely unusable.
 *
 * So: build `examples/<fw>-table-smoke` — a real workspace app using the
 * documented setup and nothing else — then execute the built bundle and count
 * what it actually renders, and read the emitted stylesheet for rules that could
 * only have come from table-core.
 *
 * ── One runner, four frameworks ─────────────────────────────────────────────
 *
 * Everything above is framework-agnostic *once the app is built*: the bundle
 * mounts itself, and what this script then does is read a DOM. So the four gates
 * are one file with a small table of differences rather than four copies of two
 * hundred lines — the same argument `table-core` itself makes.
 *
 * The four example apps stay separate, though, and deliberately. A consumer
 * building a Vue app has no React in their dependency tree, and one combined app
 * would put all four frameworks in a single closure — weakening precisely what
 * this gate tests, which is that each adapter resolves *on its own*.
 *
 * jsdom rather than a real browser, for the same reason
 * `packages/react/scripts/smoke-icons.mjs` uses it: the failure under test
 * happens at build time, and running the output only has to answer "did this
 * produce elements". No layout, no paint, nothing a CI runner has to download.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * What differs between the four.
 *
 * `adapterDist` is the built entry to assert exists — each toolchain names it
 * differently, and checking the wrong path would make this gate pass on a
 * package that never built.
 */
const FRAMEWORKS = {
  react: {
    example: "table-smoke",
    pkg: "packages/react-table",
    adapterDist: "dist/index.mjs",
  },
  vue: {
    example: "vue-table-smoke",
    pkg: "packages/vue-table",
    adapterDist: "dist/index.js",
  },
  svelte: {
    example: "svelte-table-smoke",
    pkg: "packages/svelte-table",
    adapterDist: "dist/index.js",
  },
  angular: {
    example: "angular-table-smoke",
    pkg: "packages/angular-table",
    adapterDist: "dist/fesm2022/ui-organized-angular-table.mjs",
    // Angular's own host element, rather than a `<div id="root">` the entry
    // looks up. `bootstrapApplication` finds it by the component's selector.
    mountHtml: "<app-root></app-root>",
  },
};

const framework = process.argv[2];
const config = FRAMEWORKS[framework];
if (!config) {
  process.stderr.write(
    `\n✗ Usage: node scripts/smoke-table.mjs <${Object.keys(FRAMEWORKS).join("|")}>\n\n`,
  );
  process.exit(1);
}

const exampleDir = join(repoRoot, "examples", config.example);
const distDir = join(exampleDir, "dist");
const exampleName = `@ui-organized/example-${config.example}`;

/** How many rows each example's source renders. Kept in step deliberately. */
const EXPECTED_ROWS = 4;

let failures = 0;
const check = (name, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) failures++;
};

process.stdout.write(`\nBuilding examples/${config.example} and everything it depends on…\n`);

// The trailing `...` selects the example app *and its dependency closure* —
// both table packages, the component library, tokens and utils. Building only
// the app assumes something else already built those, and a gate that assumes
// another step ran first isn't a gate.
try {
  execFileSync("pnpm", ["--filter", `${exampleName}...`, "build"], {
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

check("the adapter built", existsSync(join(repoRoot, config.pkg, config.adapterDist)));
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
  `\`@ui-organized/${framework}-table/styles\` must resolve through to table-core's dist/index.css`,
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

/**
 * Resolved from the *calling package*, not from here.
 *
 * Every other script in `scripts/` imports `node:` builtins only, and jsdom is
 * genuinely a per-adapter test dependency — each table package declares it. Under
 * pnpm's strict layout a bare `import("jsdom")` in a root-level file resolves
 * against the repo root, which does not have it and should not grow it for one
 * script. `process.cwd()` is the package directory when pnpm runs the script.
 */
const requireFromPackage = createRequire(join(process.cwd(), "package.json"));
const { JSDOM } = await import(pathToFileURL(requireFromPackage.resolve("jsdom")).href);
const dom = new JSDOM(
  `<!doctype html><html><body>${config.mountHtml ?? '<div id="root"></div>'}</body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true },
);

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
    // Trimmed, the way `tooling/parity`'s DOM contract normalises text. Angular's
    // template interpolation leaves the surrounding newlines in the caption, and
    // HTML collapses them — " Team members " and "Team members" render and are
    // announced identically. Asserting the raw string here would fail one
    // framework over whitespace the browser has already thrown away.
    doc.querySelector("caption")?.textContent?.trim() === "Team members",
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
    `a dropped @ui-organized/${framework} peer shows up here first`,
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
    ? `\n✓ ${framework} table smoke passed\n\n`
    : `\n✗ ${framework} table smoke failed — ${failures} check(s)\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
