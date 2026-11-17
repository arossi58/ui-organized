#!/usr/bin/env node
/**
 * Release gate for Svelte's and Vue's per-component stylesheets: does a
 * one-Button **production** build ship the Button's CSS, the typography and
 * base rules it leans on, and nothing else?
 *
 * Usage: `node scripts/smoke-css.mjs <framework>` where framework is `svelte`
 * or `vue`. Each library runs it as its `test:smoke:css`, so jsdom resolves
 * from the package that declares it (see `requireFromPackage` below).
 *
 * ── Why the per-component route needs a gate ────────────────────────────────
 *
 * Every Svelte and Vue component imports its own stylesheet from
 * `@ui-organized/core`, and the library entry imports `typography.css` and
 * `base.css`, which no component imports for itself. That is what lets an app
 * leave `/styles.css` out and ship only the CSS for the components it uses.
 * Each half has been broken, and every way it breaks leaves the build green:
 *
 * 1. **Every sheet ships.** Vue's library build was once a single file, which
 *    hoisted all sixty-six component imports to the top of `index.js`; importing
 *    one Button brought every stylesheet. `preserveModules` fixed it, and
 *    listing the component modules in `sideEffects` would undo it silently.
 *
 * 2. **The shared rules are missing.** Neither library used to import
 *    typography or base, so a Button arrived with its `.btn` rules while the
 *    `.text-*` class its label is set in had none. An app had to import the
 *    whole sheet anyway, which is how it went unnoticed.
 *
 * 3. **The shared rules are dropped.** The entry's imports are bare side
 *    effects in a package that tells bundlers its JS is pure. Leave the entry
 *    off `sideEffects` and the components imported through it survive while
 *    those two imports vanish, in `vite build` only.
 *
 * Unit tests import modules by name, which defeats tree shaking, and `vite dev`
 * does not tree-shake, so only a production build of a real consumer answers
 * any of this. `examples/<framework>-css-smoke` is that consumer: the token
 * baseline, one Button, and deliberately no `/styles.css`.
 *
 * jsdom rather than a real browser, as in `scripts/smoke-table.mjs`: what is
 * under test happens at build time. The render only has to show that the
 * Button the bundle mounts is one the emitted stylesheet actually styles.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * What differs between the two.
 *
 * `perComponent` is a module that only exists while the library's output keeps
 * one module per component. For Svelte that is svelte-package's nature; for
 * Vue it is `preserveModules`, and a missing file is the first sign it went.
 */
const FRAMEWORKS = {
  svelte: {
    example: "svelte-css-smoke",
    pkg: "packages/svelte",
    perComponent: "dist/components/Button/Button.svelte",
  },
  vue: {
    example: "vue-css-smoke",
    pkg: "packages/vue",
    perComponent: "dist/components/Button/Button.vue.js",
  },
};

/**
 * Rules from components the example never renders. Any one of them in the
 * emitted CSS means a stylesheet shipped that nothing asked for. Each is
 * checked against core's whole sheet first, so a renamed class fails here
 * rather than leaving a probe that can never match: the plan for this gate
 * named `.select__trigger`, which no stylesheet has ever contained.
 */
const UNUSED = [".select-field", ".dialog__popup", ".calendar__day"];

/** The typography class `CONTROL_TEXT_CLASS.md` gives the Button's label. */
const BUTTON_TEXT_CLASS = "text-default-body-large";

const framework = process.argv[2];
const config = FRAMEWORKS[framework];
if (!config) {
  process.stderr.write(
    `\n✗ Usage: node scripts/smoke-css.mjs <${Object.keys(FRAMEWORKS).join("|")}>\n\n`,
  );
  process.exit(1);
}

const exampleDir = join(repoRoot, "examples", config.example);
const distDir = join(exampleDir, "dist");
const exampleName = `@ui-organized/example-${config.example}`;

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

let failures = 0;
const check = (name, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) failures++;
};

process.stdout.write(`\nBuilding examples/${config.example} and everything it depends on…\n`);

// The trailing `...` selects the example app *and its dependency closure* —
// the library, core, tokens and utils. A gate that assumes another step built
// those first isn't a gate.
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

check(
  "the library keeps one module per component",
  existsSync(join(repoRoot, config.pkg, config.perComponent)),
  config.perComponent,
);
check("the example app builds", existsSync(join(distDir, "index.html")));

// ── The stylesheet ───────────────────────────────────────────────────────────
const assetsDir = join(distDir, "assets");
const cssFiles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((file) => file.endsWith(".css"))
  : [];
const css = (
  await Promise.all(cssFiles.map((file) => readFile(join(assetsDir, file), "utf8")))
).join("\n");
const wholeSheet = await readFile(join(repoRoot, "packages/core/dist/styles.css"), "utf8");

check("a stylesheet is emitted", cssFiles.length > 0, `${cssFiles.length} file(s)`);
// The class as a rule's selector, alone or in a list the minifier merged, and
// not merely as the prefix of a longer class (`.btn` in `.btn--primary`).
const hasRule = (className) => new RegExp(`\\.${className}\\s*[{,]`).test(css);

check("the Button's own rules are in it", hasRule("btn") && hasRule("btn--primary"));
check(
  "so are the typography rules its label is set in",
  hasRule(BUTTON_TEXT_CLASS),
  "the library entry must import @ui-organized/core/typography.css, and stay in `sideEffects`",
);
check(
  "and base.css's [hidden] invariant",
  css.includes("[hidden]:not("),
  "the library entry must import @ui-organized/core/base.css",
);

const staleProbes = UNUSED.filter((probe) => !wholeSheet.includes(probe));
check(
  "every unused-component probe names a real rule",
  staleProbes.length === 0,
  staleProbes.length ? `not in core's styles.css: ${staleProbes.join(", ")}` : "",
);
const leaked = UNUSED.filter((probe) => css.includes(probe));
check(
  "no stylesheet ships for a component the app doesn't use",
  leaked.length === 0,
  leaked.length
    ? `found ${leaked.join(", ")} — the per-component imports were hoisted or kept alive`
    : `${kB(Buffer.byteLength(css))} (${kB(gzipSync(css).length)} gzip) with the token baseline, against ${kB(Buffer.byteLength(wholeSheet))} for the whole component sheet alone`,
);

// ── The render ───────────────────────────────────────────────────────────────
const html = await readFile(join(distDir, "index.html"), "utf8");
const entry = /<script[^>]+src="([^"]+\.js)"/.exec(html)?.[1];
if (!entry) {
  process.stderr.write("\n✗ No module script found in the built index.html.\n\n");
  process.exit(1);
}

/**
 * Resolved from the *calling package*, not from here — the same arrangement as
 * `scripts/smoke-table.mjs`, for the same reason: jsdom is a per-library test
 * dependency, and the repo root does not have it.
 */
const requireFromPackage = createRequire(join(process.cwd(), "package.json"));
const { JSDOM } = await import(pathToFileURL(requireFromPackage.resolve("jsdom")).href);
// The emitted CSS goes in as a <style> so jsdom's cascade can apply it to what
// the bundle renders. Only rules from that file can style the Button here.
const dom = new JSDOM(
  `<!doctype html><html data-theme="light"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
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

const realWarn = console.warn;
const realError = console.error;
console.warn = (...args) => noise.push(args.join(" "));
console.error = (...args) => noise.push(args.join(" "));

try {
  await import(pathToFileURL(join(distDir, entry.replace(/^\//, ""))).href);
  await new Promise((resolve) => setTimeout(resolve, 50));

  const button = dom.window.document.querySelector("button");
  check("the Button renders in the production build", button?.textContent?.trim() === "Save");

  const classes = [...(button?.classList ?? [])];
  check(
    "with the recipe's and the typography's classes",
    ["btn", "btn--primary", BUTTON_TEXT_CLASS].every((name) => classes.includes(name)),
    classes.join(" "),
  );

  // Computed style, not the class list: a class with no rule behind it renders
  // unstyled and still passes every assertion above it. `display` comes from
  // `.btn`, and the font size from the typography class. jsdom does not resolve
  // custom properties, so the font size reads as the token it was set from,
  // which is exactly what shows the typography rule matched.
  const style = button ? dom.window.getComputedStyle(button) : undefined;
  check(
    "and the emitted stylesheet styles it",
    style?.display === "inline-flex" && /--type-size-body-large/.test(style?.fontSize ?? ""),
    `display: ${style?.display}; font-size: ${style?.fontSize}`,
  );
  check("no console warnings or errors", noise.length === 0, noise[0]?.slice(0, 100) ?? "");
} catch (error) {
  console.warn = realWarn;
  console.error = realError;
  process.stderr.write(`\n✗ The built bundle threw when executed.\n\n${error.stack}\n`);
  process.exit(1);
} finally {
  console.warn = realWarn;
  console.error = realError;
}

process.stdout.write(
  failures === 0
    ? `\n✓ ${framework} per-component CSS smoke passed\n\n`
    : `\n✗ ${framework} per-component CSS smoke failed — ${failures} check(s)\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
