import { expect, test, type Page } from "@playwright/test";
import { WEBKIT_TAB_ORDER, storyTest } from "../shared/interaction";

/**
 * Navigation and disclosure: Tabs, Accordion, Collapsible, Pagination, TreeView,
 * and Item's link rows.
 *
 * The shared theme here is roving focus and expand/collapse state — the two
 * places where a component can look completely correct and still be unusable
 * without a mouse.
 */

const part = (scope: string, name: string) => `[data-scope="${scope}"][data-part="${name}"]`;

// ── Tabs ─────────────────────────────────────────────────────────────────────
test.describe("Tabs", () => {
  const tab = part("tabs", "trigger");

  storyTest(
    "components-navigation-tabs--inspect",
    "moves selection with the arrow keys",
    async (page) => {
      const tabs = page.locator(tab);
      await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

      await tabs.first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
    },
  );

  storyTest(
    "components-navigation-tabs--inspect",
    "keeps exactly one tab tabbable",
    async (page) => {
      // Roving tabindex: a tablist is one tab stop, not one per tab. Getting this
      // wrong means a keyboard user has to Tab through every tab to leave the
      // list, which is the whole reason the pattern exists.
      const tabbable = await page.locator(`${tab}[tabindex="0"]`).count();
      expect(tabbable, "exactly one tab should carry tabindex=0").toBe(1);
    },
  );

  storyTest(
    "components-navigation-tabs--inspect",
    "shows the selected panel only",
    async (page) => {
      const visible = page.locator(`${part("tabs", "content")}:visible`);
      await expect(visible).toHaveCount(1);
      await page.locator(tab).first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(visible).toHaveCount(1);
    },
  );
});

// ── Accordion ────────────────────────────────────────────────────────────────
test.describe("Accordion", () => {
  const trigger = part("accordion", "item-trigger");

  storyTest("components-disclosure-accordion--inspect", "toggles a section", async (page) => {
    const first = page.locator(trigger).first();
    const expanded = await first.getAttribute("aria-expanded");
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", expanded === "true" ? "false" : "true");
  });

  storyTest(
    "components-disclosure-accordion--inspect",
    "toggles from the keyboard",
    async (page) => {
      const first = page.locator(trigger).first();
      await first.focus();
      const before = await first.getAttribute("aria-expanded");
      await page.keyboard.press("Enter");
      await expect(first).not.toHaveAttribute("aria-expanded", before ?? "");
    },
  );
});

// ── Collapsible ──────────────────────────────────────────────────────────────
test.describe("Collapsible", () => {
  storyTest("components-disclosure-collapsible--inspect", "toggles its content", async (page) => {
    const trigger = page.locator(part("collapsible", "trigger")).first();
    const content = page.locator(part("collapsible", "content")).first();
    const openAtRest = await content.isVisible();

    await trigger.click();
    if (openAtRest) await expect(content).toBeHidden();
    else await expect(content).toBeVisible();
  });
});

// ── Pagination ───────────────────────────────────────────────────────────────
// Not an Ark component — a hand-built <nav>, so it is addressed through its ARIA
// surface rather than data-part. That is the more valuable contract to pin
// anyway: `aria-current="page"` is what a screen reader announces.
test.describe("Pagination", () => {
  const current = '.pagination [aria-current="page"]';

  storyTest(
    "components-navigation-pagination--inspect",
    "advances to the next page",
    async (page) => {
      await expect(page.locator(current)).toHaveText("1");
      await page.getByLabel("Next page").click();
      await expect(page.locator(current)).toHaveText("2");
    },
  );

  storyTest(
    "components-navigation-pagination--inspect",
    "marks exactly one page current",
    async (page) => {
      await expect(page.locator(current)).toHaveCount(1);
      await page.getByLabel("Go to page 3").click();
      await expect(page.locator(current)).toHaveCount(1);
      await expect(page.locator(current)).toHaveText("3");
    },
  );

  storyTest(
    "components-navigation-pagination--inspect",
    "disables Previous on the first page",
    async (page) => {
      // Disabled rather than absent: a control that disappears shifts every other
      // control under the pointer, and gives a screen reader nothing to announce.
      await expect(page.getByLabel("Previous page")).toBeDisabled();
      await page.getByLabel("Next page").click();
      await expect(page.getByLabel("Previous page")).toBeEnabled();
    },
  );
});

// ── TreeView ─────────────────────────────────────────────────────────────────
test.describe("TreeView", () => {
  storyTest(
    "components-data-display-treeview--inspect",
    "expands and collapses a branch",
    async (page) => {
      const branch = page.locator(part("tree-view", "branch-control")).first();
      const expanded = await branch.getAttribute("aria-expanded");
      await branch.click();
      await expect(branch).not.toHaveAttribute("aria-expanded", expanded ?? "");
    },
  );
});

// ── Item ─────────────────────────────────────────────────────────────────────
test.describe("Item", () => {
  // A link row is a stretched link, not an <a> around the row: a press anywhere
  // on the row follows it, and the actions sit above that layer as their own
  // controls. Both halves break silently if a z-index or a position goes.
  const row = (page: Page, title: string) =>
    page
      .locator(".item")
      .filter({ has: page.locator(".item__title", { hasText: new RegExp(`^${title}$`) }) });

  storyTest(
    "components-data-display-item--links",
    "follows the link from anywhere on the row",
    async (page) => {
      // A real pointer at the description's spot: the link's layer is on top of
      // it, which is the point, so Playwright's own click on the description
      // would wait forever for it to be uncovered.
      const box = await row(page, "Profile").locator(".item__description").boundingBox();
      if (!box) throw new Error("the description is not laid out");
      await page.mouse.click(box.x + 4, box.y + box.height / 2);
      await expect.poll(() => page.evaluate(() => location.hash)).toBe("#profile");
    },
  );

  storyTest(
    "components-data-display-item--links",
    "leaves the link alone when an action is pressed",
    async (page) => {
      const notifications = row(page, "Notifications");
      const switchRoot = notifications.locator('[data-scope="switch"][data-part="root"]');
      await expect(switchRoot).toHaveAttribute("data-state", "checked");
      await notifications.locator('[data-scope="switch"][data-part="control"]').click();
      await expect(switchRoot).toHaveAttribute("data-state", "unchecked");

      const shared = row(page, "Shared files");
      await shared.getByRole("button", { name: "Share" }).click();
      await expect(shared.locator(".item__description")).toHaveText("Shared 1 time this session.");
      expect(await page.evaluate(() => location.hash)).toBe("");
    },
  );

  storyTest(
    "components-data-display-item--links",
    "is one tab stop per link, then its actions",
    async (page) => {
      // See WEBKIT_TAB_ORDER: Safari's default tab order skips links.
      test.skip(page.context().browser()?.browserType().name() === "webkit", WEBKIT_TAB_ORDER);
      await row(page, "Profile").locator(".item__link").focus();
      await page.keyboard.press("Tab");
      await expect(row(page, "Notifications").locator(".item__link")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(row(page, "Notifications").locator('[data-scope="switch"] input')).toBeFocused();
    },
  );
});

// ── NavigationMenu ───────────────────────────────────────────────────────────
test.describe("NavigationMenu", () => {
  const STORY = "components-navigation-navigationmenu--default";
  const trigger = part("navigation-menu", "trigger");
  const content = (value: string) => `${part("navigation-menu", "content")}[data-value="${value}"]`;
  const link = part("navigation-menu", "link");

  storyTest(STORY, "opens a panel on a click and closes it on a second", async (page) => {
    const product = page.locator(trigger).first();
    await product.click();
    await expect(product).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(content("product"))).toBeVisible();
    await product.click();
    await expect(product).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(content("product"))).toBeHidden();
  });

  storyTest(STORY, "opens on hover and closes once the pointer has left", async (page) => {
    await page.locator(trigger).first().hover();
    await expect(page.locator(content("product"))).toBeVisible();
    // Down into the panel, over the gap: still open past the close delay.
    const panel = await page.locator(content("product")).boundingBox();
    await page.mouse.move(panel!.x + 40, panel!.y + 20, { steps: 4 });
    await page.waitForTimeout(500);
    await expect(page.locator(content("product"))).toBeVisible();
    // Away from both, and it closes after the delay.
    await page.mouse.move(panel!.x + panel!.width + 300, panel!.y + panel!.height + 100, {
      steps: 4,
    });
    await expect(page.locator(content("product"))).toBeHidden();
  });

  storyTest(STORY, "moves into the open panel with ArrowDown and back with Escape", async (page) => {
    // Opened from the keyboard: WebKit does not focus a button it clicks, so a
    // click would leave the arrow keys on the body.
    const product = page.locator(trigger).first();
    await product.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(content("product"))).toBeVisible();
    await page.keyboard.press("ArrowDown");
    const links = page.locator(`${content("product")} ${link}`);
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(content("product"))).toBeHidden();
    await expect(product).toBeFocused();
  });

  storyTest(STORY, "moves along the bar with the arrow keys, without wrapping", async (page) => {
    const bar = page.locator(`${trigger}, ${part("navigation-menu", "item")} > ${link}`);
    await bar.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(bar.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(bar.last()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(bar.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(bar.first()).toBeFocused();
  });

  storyTest(STORY, "closes when a press lands outside it", async (page) => {
    await page.locator(trigger).first().click();
    await expect(page.locator(content("product"))).toBeVisible();
    const panel = await page.locator(content("product")).boundingBox();
    await page.mouse.click(panel!.x + panel!.width + 200, panel!.y + 10);
    await expect(page.locator(content("product"))).toBeHidden();
  });
});

// ── AppShell ─────────────────────────────────────────────────────────────────
test.describe("AppShell", () => {
  const menu = ".app-header__menu";
  const sheet = `${part("dialog", "content")}.app-shell__sheet`;

  storyTest(
    "components-layout-appshell--sheet",
    "opens the sheet from the menu button and closes it on a click that navigates",
    async (page) => {
      await page.locator(menu).click();
      await expect(page.locator(sheet)).toBeVisible();
      await page.locator(sheet).getByRole("button", { name: "Settings" }).click();
      await expect(page.locator(sheet)).toBeHidden();
    },
  );

  storyTest(
    "components-layout-appshell--sheet",
    "keeps the sheet open for an item that only opens its sub-pages",
    async (page) => {
      await page.locator(menu).click();
      await page.locator(sheet).getByRole("button", { name: "Team" }).click();
      await expect(page.locator(sheet).getByRole("button", { name: "Members" })).toBeVisible();
      await expect(page.locator(sheet)).toBeVisible();
    },
  );

  storyTest(
    "components-layout-appshell--sheet",
    "closes the sheet with Escape and gives focus back to the menu button",
    async (page) => {
      // Opened from the keyboard: WebKit does not focus a button it clicks.
      await page.locator(menu).focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(sheet)).toBeVisible();
      // Focus inside first: the sheet listens for Escape once it has taken
      // focus, which a loaded WebKit does a beat after it is painted.
      await expect
        .poll(() =>
          page.evaluate((selector) => !!document.querySelector(selector)?.contains(document.activeElement), sheet),
        )
        .toBe(true);
      await page.keyboard.press("Escape");
      await expect(page.locator(sheet)).toBeHidden();
      await expect(page.locator(menu)).toBeFocused();
    },
  );

  storyTest(
    "components-layout-appshell--auto",
    "moves the sidebar into a sheet below the breakpoint and back",
    async (page) => {
      const shell = page.locator(".app-shell");
      await expect(shell).toHaveAttribute("data-layout", "rail");
      await expect(page.locator(".app-shell__sidebar .sidebar")).toBeVisible();
      await expect(page.locator(menu)).toHaveCount(0);

      await page.setViewportSize({ width: 800, height: 700 });
      await expect(shell).toHaveAttribute("data-layout", "sheet");
      await expect(page.locator(".app-shell__sidebar")).toHaveCount(0);
      await page.locator(menu).click();
      await expect(page.locator(sheet)).toBeVisible();

      // Back to wide with the sheet open: it closes, and the rail returns.
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(shell).toHaveAttribute("data-layout", "rail");
      await expect(page.locator(sheet)).toHaveCount(0);
      await expect(page.locator(".app-shell__sidebar .sidebar")).toBeVisible();
    },
  );

  storyTest("components-layout-appshell--rail", "the skip link takes focus to the page", async (page) => {
    // See WEBKIT_TAB_ORDER: Safari's default tab order skips links.
    test.skip(page.context().browser()?.browserType().name() === "webkit", WEBKIT_TAB_ORDER);
    await page.keyboard.press("Tab");
    const skip = page.locator(".app-shell__skip");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main.app-shell__main")).toBeFocused();
  });
});
