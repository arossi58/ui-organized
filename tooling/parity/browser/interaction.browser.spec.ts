import { test, expect, type Page } from "@playwright/test";
import { type BrowserScenario } from "./scenarios/index.js";
import { audited, mountScenario, renderedIn, type Framework } from "./mount.js";

/**
 * The keyboard contract every component owes, in every library.
 *
 * `apps/storybook/interaction/contract.spec.ts` asserts these three invariants
 * across React's stories and has since the gate was built. Storybook depends on
 * `@ui-organized/react` alone, so Svelte, Vue and Angular have never been held
 * to any of them.
 *
 * Unlike the a11y and visual gates beside it, this one does **not** compare
 * against React. These are absolute invariants — "a component with interactive
 * parts is reachable from the keyboard" is either true of a library or it is
 * not, and a port that broke it in the same way React did would still be broken.
 * React is included for the same reason it is included in the visual gate: one
 * consistent picture across four libraries is worth more than three.
 *
 * The three are deliberately generic. Hand-written specs can only cover the
 * components someone got round to writing them for; these cover all of them,
 * which is what makes a gate meaningful on day one rather than in six months.
 *
 * ── Why invariant 2 has a scar ──────────────────────────────────────────────
 *
 * "hidden parts are not rendered" caught nothing on its first run here, because
 * it was written the day after the same check — run by hand, as a one-off script
 * — found `base.css` missing from three of the four libraries. Closed popups and
 * an unchecked Checkbox's indicator were sitting in the layout and in the
 * accessibility tree in Svelte, Vue and Angular. A gate would have caught it the
 * day the CSS moved; a hand-run script caught it months later, by luck, while
 * chasing a screenshot difference. That is the whole argument for this file.
 */

/**
 * What counts as focusable, matching the Storybook gate's list exactly.
 *
 * Two gates over one design system that disagree about what "focusable" means
 * would be worse than either alone.
 */
const FOCUSABLE_PARTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
];

/**
 * Scope the list to the mount point.
 *
 * Not a plain `${root} ${list}` template — a comma-separated list binds the root
 * to its first clause only, so `#mount a[href], button` quietly means "links
 * inside the mount, or *any* button on the page".
 */
const scoped = (root: string) => FOCUSABLE_PARTS.map((part) => `${root} ${part}`).join(", ");

/**
 * A fingerprint of everything that could express focus, across the whole page.
 *
 * A focus indicator is not always an outline on the focused element: it can be
 * an ancestor styled with `:focus-within`, a sibling, or a pseudo-element.
 * Comparing the whole subtree asks the only question that matters — when focus
 * moved, did anything visibly change?
 *
 * Erring towards a false pass is deliberate. A gate that occasionally calls a
 * good component broken gets switched off; one that occasionally misses a
 * missing ring still catches the rest.
 */
async function signature(page: Page): Promise<string> {
  return page.evaluate(() => {
    /**
     * `<body>`, not `#mount`. Every library portals its overlays out of the
     * mount, so an open dialog's focus ring is painted on an element the mount
     * does not contain — and reading only the mount reported "nothing changed
     * appearance" for every overlay in the system, which is where the keyboard
     * matters most.
     */
    const root = document.body;
    if (!root) return "";
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
    // Capped: a few scenarios render large grids, and the first 400 elements are
    // more than enough to notice a focus ring. Higher than the Storybook gate's
    // 300 because this starts at `<body>` rather than inside the mount.
    const nodes = [root, ...root.querySelectorAll("*")].slice(0, 400);
    return nodes.map((n) => `${read(n)}|${read(n, "::before")}|${read(n, "::after")}`).join("//");
  });
}

/** Style changes applied in one frame are committed by the next. */
async function settleFrames(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

interface Breach {
  framework: Framework;
  invariant: string;
  detail: string;
}

for (const scenario of audited()) {
  test(`${scenario.component} / ${scenario.name}`, async ({ page }, testInfo) => {
    const breaches: Breach[] = [];

    for (const framework of renderedIn(scenario)) {
      await mountScenario(page, framework, scenario);

      /**
       * 1 — Nothing carrying `hidden` is still in the layout.
       *
       * Ark keeps a closed part mounted and hides it with the attribute,
       * trusting the UA's `[hidden] { display: none }`. An author-level
       * `display` beats a UA rule at any specificity, so a component stylesheet
       * can leave a closed dialog reachable by keyboard and screen reader while
       * looking perfectly correct to a mouse.
       */
      const leaked = await page.evaluate(() =>
        [...document.querySelectorAll("[hidden]:not([hidden='until-found'])")]
          .filter((el) => getComputedStyle(el).display !== "none")
          .map((el) => {
            const cls = (el as HTMLElement).className;
            return `<${el.tagName.toLowerCase()} class="${typeof cls === "string" ? cls : ""}">`;
          }),
      );
      for (const element of [...new Set(leaked)]) {
        breaches.push({
          framework,
          invariant: "hidden parts are not rendered",
          detail: `${element} carries \`hidden\` but is still laid out — a stylesheet is setting \`display\` on it and out-ranking the UA rule`,
        });
      }

      /**
       * The remaining two invariants need a *fresh* mount, so they only run on
       * scenarios that replay no steps.
       *
       * Both are about the first Tab, and a scenario's steps have already put
       * focus somewhere inside the component — one more Tab from there measures
       * "what is the next control", not "can this be reached at all". Blurring
       * first does not rescue it: clearing focus also clears the document's
       * sequential navigation starting point, after which Tab does not re-enter
       * the page at all. Measured — with focus on the checkbox's input, Tab
       * moves on; after `blur()`, Tab leaves `document.activeElement` on
       * `<body>` and the check reports every component as unreachable.
       *
       * `audited()` gives each component its first scenario as well as its
       * richest, and the first is the plain mount, so this still covers
       * essentially every component.
       */
      if (scenario.steps.length > 0) continue;

      /**
       * Counted across the document, not inside `#mount`.
       *
       * Every library portals its overlays to `<body>`, so an open dialog's
       * buttons are not in the mount at all — scoping the count there reports
       * "no focusable elements" for exactly the components where the keyboard
       * matters most.
       *
       * Visible only. A closed ContextMenu and a Tour with no active step each
       * hold exactly one control inside a surface that is correctly hidden, and
       * counting those said "this component has something focusable" about a
       * component that deliberately has nothing to focus — then failed it for
       * being unreachable. Both were reported identically by all four libraries,
       * which is the signature of the check being wrong rather than the code.
       */
      const focusable = await page.locator(scoped("body")).filter({ visible: true }).count();
      if (focusable === 0) continue;

      /**
       * 2 — A component with interactive parts is reachable from the keyboard.
       *
       * This is what catches a control that only answers pointer events — the
       * `<div onClick>` class of bug, which looks and behaves perfectly until
       * you try to use it without a mouse.
       */
      const resting = await signature(page);
      await page.keyboard.press("Tab");
      await settleFrames(page);

      const landed = await page.evaluate(
        () => document.activeElement !== null && document.activeElement !== document.body,
      );
      if (!landed) {
        breaches.push({
          framework,
          invariant: "reachable by keyboard",
          detail: `${focusable} focusable element(s) on the page, and the first Tab reached none of them`,
        });
        continue;
      }

      /**
       * 3 — A focused control looks focused.
       *
       * A design system that ships an invisible focus ring is unusable by
       * keyboard even when every control is technically reachable, and that is
       * exactly the regression a CSS refactor introduces silently: nothing about
       * the mouse experience changes.
       *
       * Tab rather than `.focus()`, because `:focus-visible` is the rule that
       * paints the ring and it only matches keyboard-initiated focus.
       */
      if ((await signature(page)) === resting) {
        const element = await page.evaluate(() => {
          const a = document.activeElement as HTMLElement | null;
          if (!a) return "(nothing)";
          const cls = typeof a.className === "string" ? a.className : "";
          return `<${a.tagName.toLowerCase()}${cls ? ` class="${cls}"` : ""}>`;
        });
        breaches.push({
          framework,
          invariant: "shows a focus indicator",
          detail: `focus moved to ${element} and nothing in the mount changed appearance — a keyboard user cannot see where they are`,
        });
      }
    }

    await testInfo.attach("interaction", {
      contentType: "application/json",
      body: JSON.stringify({
        component: scenario.component,
        scenario: scenario.name,
        breaches,
      }),
    });

    expect(
      breaches,
      breaches.length
        ? `${scenario.component} / ${scenario.name} breaks the keyboard contract:\n` +
            breaches
              .map((b) => `  · ${b.framework} — ${b.invariant}\n    ${b.detail}`)
              .join("\n")
        : "",
    ).toEqual([]);
  });
}
