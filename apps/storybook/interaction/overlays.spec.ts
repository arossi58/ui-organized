import { expect, test } from "@playwright/test";
import {
  WEBKIT_TAB_ORDER,
  expectFocusWithin,
  expectSettledOpen,
  storyTest,
} from "../shared/interaction";

/**
 * Anchored and modal overlays: Dialog, AlertDialog, Popover, Menu, Tooltip, Drawer.
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

// ── Drawer ───────────────────────────────────────────────────────────────────
test.describe("Drawer", () => {
  const trigger = part("drawer", "trigger");
  const content = part("drawer", "content");
  const grabber = part("drawer", "grabber");

  /** Open, focused, and done sliding in, so a press lands where the panel rests. */
  async function openSettled(page: import("@playwright/test").Page) {
    await page.click(trigger);
    await expectSettledOpen(page, content);
    await expectFocusWithin(page, content);
    await page.waitForFunction(
      (sel) =>
        (document.querySelector(sel)?.getAnimations() ?? []).every(
          (a) => a.playState !== "running",
        ),
      content,
    );
  }

  /** Press `selector`'s centre, move `dy` down in steps, hold so there is no fling, and let go. */
  async function drag(page: import("@playwright/test").Page, selector: string, dy: number) {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`${selector} has no box`);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Paced, as a hand moves: zag reads a stopped pointer's speed off the whole
    // gesture, so twelve instant moves would read as a fling and close the
    // panel from a short drag.
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(x, y + (dy * i) / 12);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(120);
    await page.mouse.up();
  }

  storyTest(
    "components-overlay-drawer--inspect",
    "closes on Escape and returns focus",
    async (page) => {
      await openSettled(page);
      await page.keyboard.press("Escape");
      await expect(page.locator(content)).toBeHidden();
      await expect(page.locator(trigger)).toBeFocused();
    },
  );

  storyTest(
    "components-overlay-drawer--inspect",
    "closes when swiped down past halfway",
    async (page) => {
      await openSettled(page);
      // 150px of a ~175px panel: past halfway, and still inside the viewport, which
      // matters: Firefox reports a pointer dragged off the bottom of the window
      // with nonsense coordinates.
      await drag(page, grabber, 150);
      await expect(page.locator(content)).toBeHidden();
      await expect(page.locator(trigger)).toHaveAttribute("aria-expanded", "false");
    },
  );

  storyTest(
    "components-overlay-drawer--inspect",
    "springs back from a short drag",
    async (page) => {
      await openSettled(page);
      await drag(page, grabber, 30);
      const panel = page.locator(content);
      await expect(panel).toHaveAttribute("data-state", "open");
      await expect(panel).not.toHaveAttribute("data-swiping", /.*/);
      await expect(panel).toBeVisible();
    },
  );

  storyTest(
    "components-overlay-drawer--long-content",
    "scrolls rather than drags once scrolled down",
    async (page) => {
      await openSettled(page);
      const panel = page.locator(content);
      await panel.evaluate((el) => el.scrollTo({ top: 200 }));
      // A drag down on the scrolled content is the reader scrolling back up.
      await drag(page, `${content} p:nth-of-type(8)`, 120);
      await expect(panel).toHaveAttribute("data-state", "open");
    },
  );
});
