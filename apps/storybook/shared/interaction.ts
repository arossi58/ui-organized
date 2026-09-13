/**
 * Helpers for the interaction gate.
 *
 * Every interaction test names the story it drives, and the name starts with
 * the story id. That is not cosmetic: scripts/quality/aggregate.mjs reads the
 * leading story id out of the test title to attribute the result to a
 * component, using exactly the same rule it applies to the visual, a11y and
 * smoke gates.
 */
import { expect, test, type Page } from "@playwright/test";
import { openStory } from "./story";

/**
 * Declare a test against one story. The story is opened and settled before the
 * body runs, so a spec only ever describes behaviour.
 */
export function storyTest(
  storyId: string,
  name: string,
  body: (page: Page) => Promise<void>,
): void {
  test(`${storyId} › ${name}`, async ({ page }) => {
    await openStory(page, storyId);
    await body(page);
  });
}

/** Everything natively reachable by Tab, as individual selectors. */
const FOCUSABLE_PARTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
];

/**
 * Scope a selector list to a root.
 *
 * Not a plain `${root} ${list}` template — a comma-separated list would only
 * bind the root to its first clause, so `#storybook-root a[href], button`
 * quietly means "links inside the story, or *any* button on the page". That
 * reads as working and silently pulls in Storybook's own chrome, which is
 * exactly how this gate first reported twelve presentational components as
 * keyboard-inaccessible.
 */
export function scopedFocusable(root = "#storybook-root"): string {
  return FOCUSABLE_PARTS.map((part) => `${root} ${part}`).join(", ");
}

/** The focusable list, unscoped — for use inside page.evaluate. */
export const FOCUSABLE = FOCUSABLE_PARTS.join(", ");

/**
 * A visual signature of the whole story subtree.
 *
 * The focus-indicator check compares this before and after a Tab, which sidesteps
 * the question that made every earlier attempt flaky: *which* element shows the
 * ring. It can be the focused element, an ancestor styled with `:focus-within`,
 * a sibling, or a pseudo-element — and which element Tab even lands on varies by
 * engine (Safari's tab order skips buttons) and by component state. Comparing the
 * whole subtree asks the only question that actually matters: when focus moved,
 * did anything visibly change?
 *
 * Erring towards a false pass rather than a false failure is deliberate. A gate
 * that occasionally says a good component is broken gets switched off; one that
 * occasionally misses a missing ring still catches the rest.
 */
export async function storySignature(page: Page, root = "#storybook-root"): Promise<string> {
  return page.evaluate((rootSelector) => {
    const rootEl = document.querySelector(rootSelector);
    if (!rootEl) return "";
    const read = (node: Element, pseudo?: string) => {
      const s = getComputedStyle(node, pseudo);
      return [
        s.outlineStyle,
        s.outlineWidth,
        s.outlineColor,
        s.outlineOffset,
        s.boxShadow,
        s.borderColor,
        s.backgroundColor,
        s.opacity,
        s.content,
      ].join("~");
    };
    // Capped: a few stories render large grids, and the first 300 elements are
    // more than enough to notice a focus ring.
    const nodes = [rootEl, ...rootEl.querySelectorAll("*")].slice(0, 300);
    return nodes.map((n) => `${read(n)}|${read(n, "::before")}|${read(n, "::after")}`).join("//");
  }, root);
}

/** Is keyboard focus currently inside the story? */
export async function focusIsInStory(page: Page, root = "#storybook-root"): Promise<boolean> {
  return page.evaluate((rootSelector) => {
    const rootEl = document.querySelector(rootSelector);
    const active = document.activeElement;
    return !!(rootEl && active && active !== document.body && rootEl.contains(active));
  }, root);
}

/** A description of the focused element, for failure messages. */
export async function focusedDescription(page: Page): Promise<string> {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null;
    if (!a) return "(nothing)";
    const cls = typeof a.className === "string" ? a.className : "";
    return `<${a.tagName.toLowerCase()}${cls ? ` class="${cls}"` : ""}>`;
  });
}

/**
 * Wait until an overlay is not just painted but *settled*.
 *
 * `toBeVisible()` alone is not enough: it passes as soon as the element has a
 * box, which can be mid-open-transition while zag's state machine is still in
 * `opening`. A key press sent in that window is dropped, and the test fails
 * intermittently — which is worse than failing always, because the natural
 * response is a retry rather than a fix. `data-state="open"` is the machine
 * saying it is ready.
 */
export async function expectSettledOpen(page: Page, contentSelector: string): Promise<void> {
  const content = page.locator(contentSelector);
  await expect(content).toBeVisible();
  await expect(content).toHaveAttribute("data-state", "open");
}

/**
 * Wait until keyboard focus has actually moved inside an element.
 *
 * `data-state="open"` and focus arriving are two different moments, and on
 * WebKit they are far enough apart to matter: a modal reports open, then moves
 * focus to its close button a tick later. An Escape or Tab sent in between goes
 * to <body>, where nothing is listening — so the test reads "Escape doesn't
 * close the dialog" when the dialog is fine and the test was simply early.
 *
 * Verified on all three engines: focus does land inside. This waits for the
 * thing the assertion actually depends on.
 */
export async function expectFocusWithin(page: Page, selector: string): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          (sel) => document.querySelector(sel)?.contains(document.activeElement) ?? false,
          selector,
        ),
      { message: `focus never moved inside ${selector}` },
    )
    .toBe(true);
}

/**
 * Why Tab-order assertions are skipped on WebKit.
 *
 * Safari ships with "Press Tab to highlight each item" OFF. With that default,
 * Tab moves between text fields only — buttons, checkboxes and links are simply
 * not in the tab order, and Playwright's WebKit reproduces this faithfully.
 *
 * So on WebKit a button-only dialog has nothing to Tab to, and a focus-trap
 * assertion fails on the platform default rather than on any defect of ours.
 * Users who turn full keyboard access on get the correct behaviour, and there
 * is no way to set that preference from Playwright.
 *
 * Chromium and Firefox assert the tab order. WebKit still runs everything else,
 * including the whole a11y and smoke gates.
 */
export const WEBKIT_TAB_ORDER =
  "WebKit's default tab order excludes buttons and links (Safari system preference)";

/**
 * Why the focus-indicator check is skipped on WebKit.
 *
 * Playwright's WebKit does not match `:focus-visible` on an element reached by a
 * synthesized Tab — but does match it on a programmatic `.focus()`, which is the
 * opposite way round from every other engine and from the spec (a text input
 * should always match `:focus-visible` when focused). Measured directly on
 * DateInput's `.field__control`:
 *
 *   after Tab       → :focus = true, :focus-visible = false, box-shadow: none
 *   after .focus()  → :focus = true, :focus-visible = true,  box-shadow: 0 0 0 2px
 *
 * So on WebKit the check reports "no focus indicator" for components that have
 * one, and there is no way to drive real keyboard modality from Playwright.
 * Chromium and Firefox assert it; WebKit still runs every other gate.
 */
export const WEBKIT_FOCUS_VISIBLE =
  "Playwright's WebKit does not match :focus-visible on Tab-focus (it does on .focus())";

/**
 * Wait for style and paint to settle.
 *
 * Two frames, because a style change applied during the first is only committed
 * by the second. Reading a computed focus ring immediately after a Tab caught
 * WebKit before `:focus-visible` had been applied, so the "focused" sample
 * looked exactly like the resting one and the component was reported as having
 * no focus indicator when it has a perfectly good one.
 */
export async function settleFrames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
