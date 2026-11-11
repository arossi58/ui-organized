import { expect, test } from "@playwright/test";
import { storyTest } from "../shared/interaction";

/**
 * Focus rings are drawn with `outline`, not `box-shadow`, so a consumer who
 * gives a component a shadow of its own (a card lift, a raised disc) keeps the
 * focus indicator. With a box-shadow ring the consumer's shadow silently
 * replaced it, and the button read as having no focus style at all.
 */
test.describe("Focus ring", () => {
  storyTest(
    "components-actions-button--focus-ring-with-consumer-shadow",
    "survives a consumer box-shadow",
    async (page) => {
      const button = page.locator(".btn").first();
      // Programmatic focus rather than Tab: macOS WebKit skips buttons on Tab by
      // default. With no pointer interaction first, it still matches :focus-visible.
      await page.focus(".btn");
      await expect(button).toBeFocused();

      const style = await button.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow };
      });
      expect(style.boxShadow).not.toBe("none");
      expect(style.outlineStyle).toBe("solid");
      expect(style.outlineWidth).toBe("2px");
    },
  );
});
