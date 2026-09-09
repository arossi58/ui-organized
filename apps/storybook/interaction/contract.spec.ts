import { test, expect } from "@playwright/test";
import {
  WEBKIT_FOCUS_VISIBLE,
  WEBKIT_TAB_ORDER,
  focusIsInStory,
  focusedDescription,
  scopedFocusable,
  settleFrames,
  storySignature,
} from "../shared/interaction";
import { gotoStory, inspectStories } from "../shared/story";

/**
 * Gate 2, layer one — the keyboard contract every component owes, checked
 * generically against each component's canonical story.
 *
 * Hand-written specs (the other files in this directory) can only cover the
 * components someone got round to writing them for. This layer covers all of
 * them, which is what makes the gate meaningful on day one rather than in six
 * months. It asserts only what is true of every component in the system, so it
 * stays honest as components are added.
 */
test.describe("keyboard contract", () => {
  for (const story of inspectStories()) {
    /**
     * A component with interactive parts must be reachable from the keyboard.
     * This is what catches a control that only responds to pointer events — the
     * `<div onClick>` class of bug, which looks and behaves perfectly until you
     * try to use it without a mouse.
     */
    test(`${story.id} › reachable by keyboard`, async ({ page, browserName }) => {
      // See WEBKIT_TAB_ORDER — Safari's default tab order would fail this on
      // roughly every button-bearing component, for a platform preference
      // rather than a defect.
      test.skip(browserName === "webkit", WEBKIT_TAB_ORDER);

      const laidOut = await gotoStory(page, story.id);
      test.skip(!laidOut, "renders no visible content");

      const count = await page.locator(scopedFocusable()).count();
      // Presentational components (Divider, Skeleton, Card…) have nothing to
      // focus, and that is correct — not a failure.
      test.skip(count === 0, "no focusable elements — presentational component");

      // Bounded: enough to step past any leading chrome, few enough that a real
      // focus trap fails fast instead of hanging.
      const MAX_TABS = 8;
      let landed = false;
      for (let i = 0; i < MAX_TABS && !landed; i++) {
        await page.keyboard.press("Tab");
        landed = await page.evaluate(() => {
          const active = document.activeElement;
          const root = document.querySelector("#storybook-root");
          return !!(active && root && root.contains(active) && active !== document.body);
        });
      }

      expect(
        landed,
        `${story.id} has ${count} focusable element(s) but none received focus within ` +
          `${MAX_TABS} Tab presses. Something is holding focus, or the controls are ` +
          `pointer-only.`,
      ).toBe(true);
    });

    /**
     * Anything carrying the `hidden` attribute must actually be gone.
     *
     * Ark hides closed popups, collapsed branches and inactive controls with
     * `hidden` and relies on the UA's `[hidden] { display: none }`. Any
     * author-level `display` on that part silently out-ranks the UA rule, and
     * the part keeps rendering — invisible to a mouse user (the popups are also
     * `opacity: 0`), fully present to a screen reader.
     *
     * That bug shipped across Dialog, Sheet, Select, Combobox, Tour, TreeView
     * and Button before this check existed. `[hidden]` is now forced in
     * packages/core/src/base.css; this is what keeps it that way — for React.
     * `tooling/parity/browser/interaction.browser.spec.ts` asserts the same
     * invariant for the other three, which is how the rule was found to be
     * reaching React alone in the first place.
     */
    test(`${story.id} › hidden parts are not rendered`, async ({ page }) => {
      const laidOut = await gotoStory(page, story.id);
      test.skip(!laidOut, "renders no visible content");

      const leaked = await page.evaluate(() =>
        [...document.querySelectorAll("[hidden]:not([hidden='until-found'])")]
          .filter((el) => getComputedStyle(el).display !== "none")
          .map((el) => {
            const cls = (el as HTMLElement).className;
            return `<${el.tagName.toLowerCase()} class="${typeof cls === "string" ? cls : ""}">`;
          }),
      );

      expect(
        [...new Set(leaked)],
        `these elements carry \`hidden\` but are still rendered — a component ` +
          `stylesheet is setting \`display\` on them and out-ranking the UA rule`,
      ).toEqual([]);
    });

    /**
     * A focused control must *look* focused. A design system that ships an
     * invisible focus ring is unusable by keyboard even when every control is
     * technically reachable — and this is exactly the regression a CSS refactor
     * introduces silently, because nothing about the mouse experience changes.
     *
     * Compared against the element's own unfocused style rather than a
     * hard-coded ring, so components stay free to indicate focus however they
     * like.
     */
    test(`${story.id} › shows a focus indicator`, async ({ page, browserName }) => {
      // See WEBKIT_FOCUS_VISIBLE — the engine does not apply :focus-visible to a
      // Tab-focused element, so this would report a missing ring on components
      // that paint one perfectly well.
      test.skip(browserName === "webkit", WEBKIT_FOCUS_VISIBLE);

      const laidOut = await gotoStory(page, story.id);
      test.skip(!laidOut, "renders no visible content");

      const count = await page.locator(scopedFocusable()).count();
      test.skip(count === 0, "no focusable elements");

      const resting = await storySignature(page);

      // Tab rather than .focus(): `:focus-visible` is the rule that actually
      // paints the ring, and it only matches keyboard-initiated focus. Calling
      // .focus() would report a false failure on every correctly built control.
      await page.keyboard.press("Tab");
      test.skip(
        !(await focusIsInStory(page)),
        "first Tab landed outside the story — covered by the reachability test",
      );

      // Style changes applied during one frame are committed by the next, so
      // sampling immediately after Tab can read the pre-focus paint.
      await settleFrames(page);

      const element = await focusedDescription(page);
      await expect
        .poll(() => storySignature(page), {
          message:
            `${story.id}: focus moved to ${element} and nothing anywhere in the story ` +
            `changed appearance. A keyboard user cannot see where they are.`,
        })
        .not.toBe(resting);
    });
  }
});
