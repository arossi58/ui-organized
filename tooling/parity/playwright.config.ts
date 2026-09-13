import { defineConfig, devices } from "@playwright/test";

/**
 * The browser half of the parity gate. See `browser/parity.browser.spec.ts`.
 *
 * One browser, not three: this compares three libraries against each other in
 * the same engine, so a second engine would multiply the run without telling us
 * anything about the thing under test. Cross-browser behaviour is the
 * storybook app's gate.
 *
 * `retries: 0` deliberately. A parity difference that comes and goes is a real
 * finding about a race in one of the libraries, and a retry would hide it.
 */
export default defineConfig({
  testDir: "./browser",
  // The parity spec alone. The a11y gate lives beside it in the same directory
  // and shares the same harness, but it is a different gate with a different
  // config — folding it in here would add ~250 axe runs to every parity run and
  // report two different kinds of failure under one name.
  testMatch: "**/parity.browser.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
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
