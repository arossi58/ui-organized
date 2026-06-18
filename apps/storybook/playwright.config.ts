import { defineConfig, devices } from "@playwright/test";

/**
 * Visual-regression harness for the Base UI → Ark UI migration (the plan's §8
 * "visual regression" gate / §4.4 baseline oracle).
 *
 * Flow: `storybook build` → serve `storybook-static` → screenshot every story's
 * canvas → diff against committed baselines in `visual/__screenshots__/`.
 *
 * Determinism: pinned viewport, forced light color-scheme + `theme:light` global
 * (see visual.spec.ts), animations frozen and caret hidden during capture, and a
 * clean browser context (no localStorage → default brand, not a site override).
 *
 * Baselines are platform-suffixed; macOS baselines won't match a Linux CI runner.
 * Regenerate per-platform with `pnpm test:visual:update`.
 */
export default defineConfig({
  testDir: "./visual",
  snapshotPathTemplate: "visual/__screenshots__/{arg}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://127.0.0.1:6007",
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
    deviceScaleFactor: 1,
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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec http-server storybook-static -p 6007 -s -c-1",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
