import { test, expect } from "@playwright/test";
import { allStories, gotoStory } from "../shared/story";

/**
 * Gate 1 — visual regression. One screenshot per Storybook *story* (docs pages
 * are skipped). Stories come from the build's `index.json`, so the suite always
 * matches what was built — no hand-maintained list.
 *
 * Capturing `#storybook-root` clips to the story content (and captures content
 * taller than the viewport). Known gap: portaled overlays render on <body>,
 * outside the root, so they are not in these shots — the interaction gate
 * exercises those behaviourally instead.
 *
 * This gate is **warn-only** in CI. A pixel diff is very often an intended
 * design change, and a gate that cries wolf on every deliberate restyle is a
 * gate people learn to force-merge past. It still reports, and the result
 * shows up on the component's docs page.
 */
test.describe("visual regression", () => {
  for (const story of allStories()) {
    test(story.id, async ({ page }) => {
      const laidOut = await gotoStory(page, story.id);
      test.skip(!laidOut, "renders no visible content");
      await expect(page.locator("#storybook-root")).toHaveScreenshot(`${story.id}.png`);
    });
  }
});
