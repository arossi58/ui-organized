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
//   /llms.txt    → AI index (llms.txt convention)
//   /ai/*.md     → per-component machine-verified specs
//   /coverage/   → placeholder (real coverage report is a deferred follow-up)
//   /quality/    → placeholder (real quality dashboard is a deferred follow-up)
//   /.assetsignore → excludes files Workers should not serve
//
// Run directly for local verification: `node scripts/assemble-site.mjs`
import { rmSync, mkdirSync, cpSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

// The marketing app is a BrowserRouter SPA, so a direct hit on a client route
// (e.g. /docs/theming) has no matching file. Workers `not_found_handling:
// "single-page-application"` handles that by serving /index.html with a **200**
// — see wrangler.jsonc for why the status matters.
//
// 404.html is written anyway, as a fallback for any host that looks for it (it
// is what GitHub Pages served, and what `404-page` mode would serve). It costs
// one copy of the shell and means the site degrades to working-but-404 rather
// than broken if the asset config is ever changed back. Assets are absolute
// under BASE_PATH=/, so they load regardless of the route's depth.
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

// ── AI surface: /llms.txt + /ai/<Component>.md ──────────────────────────────
// Generated from the Code Connect manifest by the same buildAiContext() the
// docs site's "Copy for AI" button uses, so the short "fetch this URL" prompt
// it offers resolves to exactly the spec the long form would have pasted.
// Shelled out rather than inlined so this script stays a pure file-copier.
execFileSync(
  "pnpm",
  ["--filter", "@ui-organized/code-connect", "exec", "tsx", "scripts/generate-ai-docs.ts", OUT],
  { stdio: "inherit", cwd: repoRoot },
);

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
console.log("  + AI surface: /llms.txt, /ai/*.md  |  + placeholders: /coverage, /quality");
console.log("  + 404.html (SPA shell)  |  + .assetsignore");
console.log("  NOTE: /quality and /coverage are placeholders pending the deferred data pipeline.");
