import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * One screenshot test per Storybook *story* (docs pages are skipped). Stories are
 * read from the build's `index.json`, so the suite always matches what was built —
 * no hand-maintained list. Capturing `#storybook-root` clips to the story content
 * (and captures content taller than the viewport). Portaled overlays render on
 * <body>, outside the root — revisit a body-level capture for Wave 3 floating
 * components.
 */
const index = JSON.parse(
  readFileSync(resolve(__dirname, "../storybook-static/index.json"), "utf8"),
) as { entries: Record<string, { id: string; type: string; name: string; title: string }> };

const stories = Object.values(index.entries).filter((e) => e.type === "story");

test.describe("visual regression", () => {
  for (const story of stories) {
    test(story.id, async ({ page }) => {
      // viewMode=story → bare canvas; globals=theme:light → deterministic theme.
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`);
      const root = page.locator("#storybook-root");
      await root.waitFor({ state: "attached" });
      // Wait for Storybook to finish rendering (handles stories that render empty,
      // e.g. FieldError with no error), then let webfonts settle.
      await page.waitForFunction(() => {
        const c = document.body.classList;
        return c.contains("sb-show-main") && !c.contains("sb-show-preparing");
      });
      await page.evaluate(() => document.fonts.ready);
      // Some stories intentionally render nothing (e.g. FieldError with an empty
      // message) → a zero-size root with no visual to regress. Skip those.
      const box = await root.boundingBox();
      test.skip(!box || box.width === 0 || box.height === 0, "renders no visible content");
      await expect(root).toHaveScreenshot(`${story.id}.png`);
    });
  }
});
