import { defineConfig, devices } from "@playwright/test";

/**
 * The per-framework accessibility gate. See `browser/a11y.browser.spec.ts`.
 *
 * A separate config from the parity gate's rather than a second project inside
 * it, because the two answer different questions and fail for different reasons:
 * parity says "these four libraries disagree", a11y says "this one is wrong".
 * Running them together would report both under one name and make every parity
 * run pay for ~250 axe scans.
 *
 * One engine, for the same reason the parity gate gives: this compares four
 * libraries in the same browser, and the a11y tree axe reads is computed from
 * markup and CSS that do not change between engines. Cross-engine differences
 * are the Storybook app's gate.
 *
 * `retries: 0`: an accessibility violation that comes and goes is a real finding
 * about a race in one of the libraries, and a retry would hide it.
 */
export default defineConfig({
  testDir: "./browser",
  testMatch: "**/a11y.browser.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "../../.quality/a11y-frameworks.json" }]],
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
