import { defineConfig, devices } from "@playwright/test";

/**
 * The per-framework keyboard contract. See `browser/interaction.browser.spec.ts`.
 *
 * **Blocking**, like `apps/storybook`'s interaction gate: a component that cannot
 * be reached or seen from the keyboard is broken for a whole class of users, and
 * that is not an advisory finding.
 *
 * One engine, unlike the Storybook gate which runs three. The invariants here are
 * about the library's own markup and CSS rather than about engine behaviour, and
 * the two engine-specific carve-outs the Storybook gate needs — Safari's tab order
 * and its `:focus-visible` handling — are precisely why running them elsewhere
 * would report platform preferences as defects. Cross-engine behaviour stays the
 * Storybook app's gate.
 *
 * `retries: 0` deliberately: a focus ring that comes and goes is a real finding.
 */
export default defineConfig({
  testDir: "./browser",
  testMatch: "**/interaction.browser.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "../../.quality/interaction-frameworks.json" }]],
  use: {
    baseURL: "http://127.0.0.1:5199",
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec vite --config browser/vite.config.ts --port 5199 --strictPort",
    url: "http://127.0.0.1:5199/react.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
