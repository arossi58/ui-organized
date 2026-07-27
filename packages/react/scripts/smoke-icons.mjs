#!/usr/bin/env node
/**
 * Release gate: do icons survive a **production** build?
 *
 * `@ui-organized/react@5.0.0` shipped with icons that rendered in `vite dev` and
 * vanished in `vite build`. Each icon library sits behind a subpath that
 * registers itself by side effect:
 *
 *     import "@ui-organized/react/icons/lucide";   // registerIconSet(lucideIcons)
 *
 * …but package.json declared `sideEffects: ["**\/*.css"]`, telling every bundler
 * the JS in this package is pure. A side-effect-only import of a module the
 * bundler believes is pure is precisely what tree shaking deletes. The
 * registration never ran, `<Icon>` rendered nothing, and the build stayed green.
 *
 * Nothing cheaper catches it:
 *
 * - Unit tests import the module by name, which defeats tree shaking, so they
 *   pass either way.
 * - `vite dev` doesn't tree-shake, so development is always fine.
 * - Grepping the bundle proves nothing: production output is minified, so
 *   `registerIconSet` is absent whether or not the call survived. Measuring that
 *   way initially read as "the fix didn't work" when the fix was correct.
 *
 * So: build `examples/icon-smoke` — a real workspace app using the documented
 * setup and nothing else — then execute the built bundle and count the `<svg>`
 * elements it actually renders. Only the runtime answer is trustworthy.
 *
 * jsdom rather than a real browser, deliberately. The tree shaking under test
 * happens at *build* time; running the output only has to answer "did the
 * registration execute, and does `<Icon>` produce an element" — no layout, no
 * paint, no CSS. jsdom answers that identically to Chromium, in a second, with
 * nothing to install. The first version of this used Playwright and failed in CI
 * because the runner has no browser binaries: a gate that needs a 150 MB
 * download it never asked for isn't a gate.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(pkgRoot));
const exampleDir = join(repoRoot, "examples", "icon-smoke");
const distDir = join(exampleDir, "dist");

/** How many icons `src/main.jsx` renders. Kept in step deliberately. */
const EXPECTED_ICONS = 8;

let failures = 0;
const check = (name, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) failures++;
};


process.stdout.write("\nBuilding examples/icon-smoke and everything it depends on…\n");

// The trailing `...` selects the example app *and its dependency closure* —
// @ui-organized/react, plus tokens, utils and schema, which react needs at
// runtime. Building only this package was the first version of this gate, and it
// failed in CI: nothing else builds those, so the app's build died resolving
// them. A gate that assumes another step ran first isn't a gate.
try {
  execFileSync("pnpm", ["--filter", "@ui-organized/example-icon-smoke...", "build"], {
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

check("the library built", existsSync(join(pkgRoot, "dist", "icons", "lucide.mjs")));
check("the example app builds", existsSync(join(distDir, "index.html")));

// The one JS bundle Vite emitted, found via the built index.html rather than a
// glob — the hashed filename changes every build.
const html = await readFile(join(distDir, "index.html"), "utf8");
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

// React reads these off the global scope. Assigned rather than passed, because
// the bundle is imported as an ordinary module, not evaluated inside jsdom's
// script runner — that keeps Node's own module resolution and error reporting.
const noise = [];

// `defineProperty` rather than assignment: Node ≥21 defines a getter-only
// `globalThis.navigator`, so a plain assignment throws.
const defineGlobal = (name, value) =>
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });

// Install jsdom's whole window surface rather than a hand-picked list. Naming
// globals individually turns into whack-a-mole — React needs some, Vite's module
// preload polyfill needs MutationObserver, and the next bundler change will need
// something else. Everything Node already provides is left alone.
defineGlobal("window", dom.window);
defineGlobal("document", dom.window.document);
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in globalThis) continue;
  const value = dom.window[key];
  if (typeof value === "function" || (value && typeof value === "object")) defineGlobal(key, value);
}
// These two Node does have, but not wired to this document.
defineGlobal("navigator", dom.window.navigator);
defineGlobal("requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0));
defineGlobal("cancelAnimationFrame", clearTimeout);

const realWarn = console.warn;
const realError = console.error;
console.warn = (...args) => noise.push(args.join(" "));
console.error = (...args) => noise.push(args.join(" "));

try {
  await import(pathToFileURL(join(distDir, entry.replace(/^\//, ""))).href);
  // React 18 renders synchronously through createRoot().render, but let any
  // queued microtask settle before measuring.
  await new Promise((resolve) => setTimeout(resolve, 50));

  const svgs = dom.window.document.querySelectorAll("svg").length;
  const slots = dom.window.document.querySelectorAll(".icon").length;

  check(
    "icons render in the production build",
    svgs > 0,
    svgs > 0
      ? `${svgs} <svg> in ${slots} slots`
      : "0 rendered — the registration import was tree-shaken. Check `sideEffects` in packages/react/package.json.",
  );
  check("every icon rendered, not just some", svgs === EXPECTED_ICONS, `${svgs} of ${EXPECTED_ICONS}`);
  check("no console warnings or errors", noise.length === 0, noise[0]?.slice(0, 100) ?? "");
} finally {
  console.warn = realWarn;
  console.error = realError;
  dom.window.close();
}

process.stdout.write(
  failures === 0
    ? "\n✓ Icons survive a production build.\n\n"
    : `\n✗ ${failures} icon smoke check${failures > 1 ? "s" : ""} failed — do not publish.\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
