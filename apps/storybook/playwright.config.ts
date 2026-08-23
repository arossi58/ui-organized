import { defineConfig, devices } from "@playwright/test";

/**
 * The browser-driven half of the quality suite: four gates, nine projects, one
 * built Storybook.
 *
 *   visual       — screenshot every story, diff against committed baselines
 *   interaction  — hand-written behaviour specs, on all three engines
 *   a11y         — axe-core over every story (and the canonical one elsewhere)
 *   smoke        — every story renders clean on Firefox and WebKit
 *
 * Each gate is run by its own `test:*` script, which pins
 * PLAYWRIGHT_JSON_OUTPUT_NAME so the report lands in `.quality/` for
 * scripts/quality/aggregate.mjs. Exit codes are deliberately NOT the source of
 * truth — the warn-only gates (visual, smoke) run under `continue-on-error` in
 * CI, so their results have to survive a non-zero exit.
 *
 * Determinism for the pixel gate: pinned viewport, forced light color-scheme +
 * `theme:light` global (see shared/story.ts), animations frozen and caret hidden
 * during capture, and a clean browser context (no localStorage → default brand,
 * not a site override).
 *
 * Baselines are **Linux-only**, and rendered inside the pinned Playwright
 * container by `pnpm --filter @ui-organized/storybook test:visual:docker`. Font
 * rasterisation differs between macOS, a bare ubuntu-latest runner and that
 * image, so a single platform is the only way baselines mean the same thing
 * everywhere. `snapshotPathTemplate` keeps the `{platform}` suffix so a stray
 * host-native run writes a file CI ignores rather than silently overwriting the
 * real baseline.
 */

/** Every gate drives the same static build over one shared server. */
const webServer = {
  command: "pnpm exec http-server storybook-static -p 6007 -s -c-1",
  url: "http://127.0.0.1:6007",
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
};

const chrome = devices["Desktop Chrome"];
const firefox = devices["Desktop Firefox"];
const webkit = devices["Desktop Safari"];

export default defineConfig({
  // Per-project testDir; this is the root they resolve against.
  testDir: ".",
  snapshotPathTemplate: "visual/__screenshots__/{arg}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry in CI only, and only because WebKit's first navigation after a
  // cold start is occasionally slow enough to time out. A test that needs more
  // than one retry is a test that is telling you something.
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://127.0.0.1:6007",
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
    deviceScaleFactor: 1,
    trace: process.env.CI ? "retain-on-failure" : "off",
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // Tolerate sub-pixel antialiasing noise; real visual drift is far larger.
      maxDiffPixelRatio: 0.01,
    },
  },

  projects: [
    // ── Gate 1: visual regression (chromium only) ─────────────────────────
    // Pixels are compared on one engine on purpose. Three sets of baselines
    // would triple the regeneration cost of every intentional design change
    // while mostly re-detecting the same diff. Cross-engine breakage is the
    // smoke gate's job, on behaviour rather than pixels.
    { name: "visual", testDir: "./visual", use: { ...chrome } },

    // ── Gate 2: interaction (all three engines) ───────────────────────────
    { name: "interaction-chromium", testDir: "./interaction", use: { ...chrome } },
    { name: "interaction-firefox", testDir: "./interaction", use: { ...firefox } },
    { name: "interaction-webkit", testDir: "./interaction", use: { ...webkit } },

    // ── Gate 3: accessibility ─────────────────────────────────────────────
    // Chromium audits every story; Firefox and WebKit audit only each
    // component's canonical instance (see AXE_SCOPE in a11y/axe.spec.ts).
    // Full axe on ~300 stories × 3 engines is ~900 runs to re-find largely the
    // same violations — the markup is identical, only the a11y tree differs.
    { name: "a11y-chromium", testDir: "./a11y", use: { ...chrome } },
    { name: "a11y-firefox", testDir: "./a11y", grep: /@canonical/, use: { ...firefox } },
    { name: "a11y-webkit", testDir: "./a11y", grep: /@canonical/, use: { ...webkit } },

    // ── Gate 5: cross-browser render smoke ────────────────────────────────
    // Chromium is absent by design: the visual and a11y gates already load
    // every story there, so a third chromium pass would find nothing new.
    { name: "smoke-firefox", testDir: "./smoke", use: { ...firefox } },
    { name: "smoke-webkit", testDir: "./smoke", use: { ...webkit } },
  ],

  webServer,
});
