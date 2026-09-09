import { expect, test } from "@playwright/test";
import { storyTest } from "../shared/interaction";

/**
 * Navigation and disclosure: Tabs, Accordion, Collapsible, Pagination, TreeView.
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
