import { expect, test } from "@playwright/test";
import {
  WEBKIT_TAB_ORDER,
  expectFocusWithin,
  expectSettledOpen,
  storyTest,
} from "../shared/interaction";

/**
 * Anchored and modal overlays: Dialog, AlertDialog, Popover, Menu, Tooltip.
 *
 * These are the components the visual gate structurally cannot cover — Ark
 * portals their content to <body>, outside the `#storybook-root` element the
 * screenshots clip to. Everything asserted here is behaviour no pixel diff
 * would ever have seen.
 *
 * Selectors use Ark's own `data-scope` / `data-part` attributes rather than our
 * class names: they are the component's public structural contract, so a purely
 * cosmetic class rename doesn't break the suite, while a change to the actual
 * anatomy correctly does.
 */

const part = (scope: string, name: string) => `[data-scope="${scope}"][data-part="${name}"]`;

// ── Dialog ───────────────────────────────────────────────────────────────────
test.describe("Dialog", () => {
  const trigger = part("dialog", "trigger");
  const content = part("dialog", "content");

  storyTest("components-overlay-dialog--inspect", "opens from its trigger", async (page) => {
    // Hidden, not absent: Ark keeps the popup mounted and toggles `hidden`, so
    // asserting on count would pass for the wrong reason (or fail for one).
    await expect(page.locator(content)).toBeHidden();
    await page.click(trigger);
    await expect(page.locator(content)).toBeVisible();
  });

  storyTest("components-overlay-dialog--inspect", "closes on Escape", async (page) => {
    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    await page.keyboard.press("Escape");
    // Asserted on visibility, not `data-state`: a popup whose CSS sets
    // `display` can keep painting after Ark has marked it closed, so the state
    // attribute can read "closed" while the overlay is still on screen.
    await expect(page.locator(content)).toBeHidden();
  });

  storyTest("components-overlay-dialog--inspect", "returns focus to the trigger", async (page) => {
    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    await page.keyboard.press("Escape");
    await expect(page.locator(content)).toBeHidden();
    // Losing focus to <body> on close strands a keyboard user at the top of the
    // document with no idea where they were.
    await expect(page.locator(trigger)).toBeFocused();
  });

  storyTest("components-overlay-dialog--inspect", "traps focus while open", async (page) => {
    // See WEBKIT_TAB_ORDER: this dialog's controls are all buttons, which
    // Safari's default tab order skips, so there is nothing for Tab to reach.
    test.skip(page.context().browser()?.browserType().name() === "webkit", WEBKIT_TAB_ORDER);

    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        (sel) => !!document.querySelector(sel)?.contains(document.activeElement),
        content,
      );
      expect(inside, `Tab #${i + 1} moved focus outside the open dialog`).toBe(true);
    }
  });
});

// ── AlertDialog ──────────────────────────────────────────────────────────────
test.describe("AlertDialog", () => {
  const trigger = part("dialog", "trigger");
  const content = part("dialog", "content");

  storyTest(
    "components-overlay-alertdialog--inspect",
    "opens and closes on Escape",
    async (page) => {
      await page.click(trigger);
      await expectSettledOpen(page, content);
      await expectFocusWithin(page, content);
      await page.keyboard.press("Escape");
      await expect(page.locator(content)).toBeHidden();
    },
  );
});

// ── Popover ──────────────────────────────────────────────────────────────────
test.describe("Popover", () => {
  const trigger = part("popover", "trigger");
  const content = part("popover", "content");

  storyTest("components-overlay-popover--inspect", "toggles from its trigger", async (page) => {
    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    await page.keyboard.press("Escape");
    await expect(page.locator(content)).toBeHidden();
  });

  storyTest("components-overlay-popover--inspect", "marks the trigger expanded", async (page) => {
    await expect(page.locator(trigger)).toHaveAttribute("aria-expanded", "false");
    await page.click(trigger);
    await expect(page.locator(trigger)).toHaveAttribute("aria-expanded", "true");
  });
});

// ── Menu ─────────────────────────────────────────────────────────────────────
test.describe("Menu", () => {
  const trigger = part("menu", "trigger");
  const content = part("menu", "content");

  storyTest("components-overlay-menu--inspect", "opens and closes on Escape", async (page) => {
    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    await page.keyboard.press("Escape");
    await expect(page.locator(content)).toBeHidden();
  });

  storyTest(
    "components-overlay-menu--inspect",
    "opens from the keyboard and highlights an item",
    async (page) => {
      await page.focus(trigger);
      await page.keyboard.press("Enter");
      await expectSettledOpen(page, content);
      await page.keyboard.press("ArrowDown");
      // Ark marks the active item with data-highlighted rather than moving DOM
      // focus, which is the correct aria-activedescendant pattern for a menu.
      await expect(page.locator(`${content} [data-highlighted]`).first()).toBeVisible();
    },
  );
});

// ── Tooltip ──────────────────────────────────────────────────────────────────
test.describe("Tooltip", () => {
  storyTest("components-overlay-tooltip--inspect", "appears on keyboard focus", async (page) => {
    const trigger = page.locator(part("tooltip", "trigger")).first();
    await trigger.focus();
    // A tooltip that only opens on hover is invisible to keyboard and touch
    // users — WCAG 1.4.13 exists precisely because this is such a common miss.
    await expect(page.locator(part("tooltip", "content")).first()).toBeVisible();
  });
});
