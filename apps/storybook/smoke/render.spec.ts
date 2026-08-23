import { test, expect } from "@playwright/test";
import { allStories, collectPageErrors, gotoStory } from "../shared/story";

/**
 * Gate 5 — cross-browser render smoke.
 *
 * The cheap breadth gate. Every story, on Firefox and WebKit: does it render,
 * and does it do so without throwing? No screenshots, no interaction — just the
 * question chromium-only pixel testing can never answer, which is whether the
 * component survives a different engine at all.
 *
 * This is where a WebKit-unsupported CSS feature, a Firefox-only layout
 * assertion or an unguarded browser API shows up. Those break Safari users
 * silently today, because nothing in CI has ever loaded these components
 * anywhere but Chromium.
 *
 * Warn-only in CI: engine-specific console noise from third-party code is real,
 * and this gate is most useful as a signal on the docs page rather than as a
 * merge blocker on day one.
 */
test.describe("renders cleanly", () => {
  for (const story of allStories()) {
    test(story.id, async ({ page }) => {
      // Attach the listeners before navigating, or the errors thrown during
      // first render — the interesting ones — are missed.
      const errors = collectPageErrors(page);

      const laidOut = await gotoStory(page, story.id);
      test.skip(!laidOut, "renders no visible content");

      // Give a beat for errors thrown in effects, which run after layout.
      await page.waitForTimeout(150);

      expect(
        errors,
        errors.length
          ? `${story.id} logged ${errors.length} error(s):\n  ${errors.join("\n  ")}`
          : "",
      ).toEqual([]);
    });
  }
});
