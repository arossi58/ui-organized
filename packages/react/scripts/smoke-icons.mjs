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
 * setup and nothing else — serve the built output, and count the `<svg>`
 * elements a browser actually renders. Only the runtime answer is trustworthy.
 */

import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml" };

if (!existsSync(join(pkgRoot, "dist", "icons", "lucide.mjs"))) {
  process.stderr.write(
    `\n✗ ${join(pkgRoot, "dist/icons/lucide.mjs")} doesn't exist — the library isn't built.\n` +
      `  Run \`pnpm build\` in packages/react first.\n\n`,
  );
  process.exit(1);
}

process.stdout.write("\nBuilding examples/icon-smoke against the real package…\n");

execFileSync("pnpm", ["--filter", "@ui-organized/example-icon-smoke", "build"], {
  cwd: repoRoot,
  stdio: ["ignore", "pipe", "pipe"],
});
check("the example app builds", existsSync(join(distDir, "index.html")));

const server = createServer(async (req, res) => {
  const path = !req.url || req.url === "/" ? "/index.html" : req.url.split("?")[0];
  try {
    const body = await readFile(join(distDir, path));
    res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, resolve));
const url = `http://localhost:${server.address().port}/`;

const { chromium } = await import(
  join(repoRoot, "node_modules/.pnpm/node_modules/playwright/index.mjs")
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const noise = [];
  page.on("console", (m) => {
    if (m.type() === "warning" || m.type() === "error") noise.push(m.text());
  });
  page.on("pageerror", (e) => noise.push(String(e)));

  await page.goto(url, { waitUntil: "networkidle" });
  const rendered = await page.evaluate(() => ({
    svgs: document.querySelectorAll("svg").length,
    slots: document.querySelectorAll(".icon").length,
  }));

  check(
    "icons render in the production build",
    rendered.svgs > 0,
    rendered.svgs > 0
      ? `${rendered.svgs} <svg> in ${rendered.slots} slots`
      : "0 rendered — the registration import was tree-shaken. Check `sideEffects` in packages/react/package.json.",
  );
  check("every icon rendered, not just some", rendered.svgs === EXPECTED_ICONS, `${rendered.svgs} of ${EXPECTED_ICONS}`);
  check("no console warnings or page errors", noise.length === 0, noise[0]?.slice(0, 100) ?? "");
} finally {
  await browser.close();
  server.close();
}

process.stdout.write(
  failures === 0
    ? "\n✓ Icons survive a production build.\n\n"
    : `\n✗ ${failures} icon smoke check${failures > 1 ? "s" : ""} failed — do not publish.\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
