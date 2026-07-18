// Assemble the Cloudflare Workers deploy directory (_site/) from the already-built
// app outputs. Ported from the old GitHub Pages "Assemble site" step
// (.github/workflows/deploy.yml) so CI (ci.yml) and manual staging
// (deploy-staging.yml) share one assembly path via the build-site composite action.
//
// Prerequisite: the three apps must already be built:
//   apps/marketing/dist, apps/builder/dist, apps/storybook/storybook-static
//
// Layout produced (like-for-like with the previous Pages site):
//   /            → marketing app (BrowserRouter SPA)
//   /404.html    → copy of the marketing shell (SPA fallback; see not_found_handling)
//   /builder/    → builder app
//   /storybook/  → white-labeled Storybook
//   /coverage/   → placeholder (real coverage report is a deferred follow-up)
//   /quality/    → placeholder (real quality dashboard is a deferred follow-up)
//   /.assetsignore → excludes files Workers should not serve
//
// Run directly for local verification: `node scripts/assemble-site.mjs`
import { rmSync, mkdirSync, cpSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(repoRoot, "_site");

const src = {
  marketing: resolve(repoRoot, "apps/marketing/dist"),
  builder: resolve(repoRoot, "apps/builder/dist"),
  storybook: resolve(repoRoot, "apps/storybook/storybook-static"),
};

for (const [name, dir] of Object.entries(src)) {
  if (!existsSync(dir)) {
    console.error(
      `✖ Missing build output for ${name}: ${dir}\n` +
        `  Build the apps first (the build-site composite action does this in CI).`,
    );
    process.exit(1);
  }
}

// Start clean so stale files never leak into a deploy.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Marketing at the site root.
cpSync(src.marketing, OUT, { recursive: true });

// SPA fallback: the marketing app is a BrowserRouter SPA, so a direct hit on a
// client route (e.g. /docs) has no matching file. Workers `not_found_handling:
// "404-page"` serves the nearest 404.html (with a 404 status); making it the app
// shell lets React Router resolve the route client-side — identical to how
// GitHub Pages served 404.html. Assets are absolute under BASE_PATH=/, so they
// load regardless of the requested route's depth.
const marketingIndex = resolve(OUT, "index.html");
if (!existsSync(marketingIndex)) {
  console.error(`✖ marketing build has no index.html at ${marketingIndex}`);
  process.exit(1);
}
copyFileSync(marketingIndex, resolve(OUT, "404.html"));

// Builder under /builder/.
cpSync(src.builder, resolve(OUT, "builder"), { recursive: true });

// Storybook under /storybook/ (its static build uses relative asset paths).
cpSync(src.storybook, resolve(OUT, "storybook"), { recursive: true });

// ── Placeholders ────────────────────────────────────────────────────────────
// /coverage and /quality are part of the deploy path contract, but the data
// pipeline that populates them (coverage tooling, JUnit, token-contrast / a11y /
// coverage-summary emitters) is a deferred follow-up. Ship dependency-free
// static placeholders so the URLs are stable; wire real content in later.
const placeholder = (title, body) =>
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title} — UI Organized</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0; min-height: 100vh; display: grid; place-items: center;
        font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, sans-serif;
        background: Canvas; color: CanvasText; padding: 2rem;
      }
      main { max-width: 34rem; text-align: center; }
      h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
      p { margin: 0 0 1rem; opacity: .8; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      a { color: inherit; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      ${body}
      <p><a href="/">← Back to UI Organized</a></p>
    </main>
  </body>
</html>
`;

mkdirSync(resolve(OUT, "coverage"), { recursive: true });
writeFileSync(
  resolve(OUT, "coverage/index.html"),
  placeholder(
    "Coverage report",
    `<p>The test-coverage report will be published here once coverage tooling
      (<code>@vitest/coverage-v8</code>) is wired into CI.</p>`,
  ),
);

mkdirSync(resolve(OUT, "quality"), { recursive: true });
writeFileSync(
  resolve(OUT, "quality/index.html"),
  placeholder(
    "Quality dashboard",
    `<p>The quality dashboard (token-contrast table, a11y pass rate, coverage
      summary) will render here once the test-output JSON feed is generated.
      <strong>Placeholder — needs design + a data pipeline.</strong></p>`,
  ),
);

// Workers does not auto-exclude the files Pages did — do it explicitly.
writeFileSync(
  resolve(OUT, ".assetsignore"),
  ["**/node_modules", "**/.DS_Store", "**/.git", ""].join("\n"),
);

console.log("✓ Assembled _site/ (marketing → /, builder → /builder/, storybook → /storybook/)");
console.log("  + placeholders: /coverage, /quality  |  + 404.html (SPA shell)  |  + .assetsignore");
console.log("  NOTE: /quality and /coverage are placeholders pending the deferred data pipeline.");
