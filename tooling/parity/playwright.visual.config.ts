import { defineConfig, devices } from "@playwright/test";

/**
 * The per-framework visual gate. See `browser/visual.browser.spec.ts`.
 *
 * **Advisory**, like `apps/storybook`'s visual gate: antialiasing at a subpixel
 * boundary is not a defect, and a gate that blocks a merge over one teaches
 * people to ignore it. `scripts/quality/run.mjs` keeps it out of the blocking
 * set for the same reason.
 *
 * One engine, and it has to be: this compares four libraries against each other
 * by pixel, so both sides of every comparison must be drawn by the same
 * renderer. A second engine would not add coverage, it would add noise.
 *
 * `retries: 0` deliberately. A visual difference that comes and goes is a real
 * finding about a race in one of the libraries, and a retry would hide it.
 */
export default defineConfig({
  testDir: "./browser",
  testMatch: "**/visual.browser.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "../../.quality/visual-frameworks.json" }]],
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
