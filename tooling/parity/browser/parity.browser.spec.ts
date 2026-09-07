import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { contractOf, hiddenFromAssistiveTech, type ElementContract } from "../src/contract.js";
import { SCENARIOS, type BrowserScenario } from "./scenarios/index.js";
import { FRAMEWORKS, comparedIn, mountScenario, type Framework } from "./mount.js";

/**
 * The browser half of the parity gate.
 *
 * Same premise as the SSR half — same props in, same DOM contract out — with
 * the one difference that makes portalled and interactive state reachable: a
 * real document. React stays the reference; Svelte and Vue are each compared
 * against it rather than against each other, so a divergence names one culprit.
 *
 * Each scenario navigates all three pages *in the same test*, so a failure
 * reports the three captures side by side. The comparisons are soft, because
 * "Svelte drifted" and "Vue drifted" are different findings and reporting only
 * the first would hide the second.
 */

const require = createRequire(import.meta.url);
const CORE_SRC = join(
  dirname(require.resolve("@ui-organized/core/package.json")),
  "src/components",
);

function withoutAllowed(contract: ElementContract[], allowed: string[]): ElementContract[] {
  if (!allowed.length) return contract;
  return contract.map((el) => ({
    ...el,
    attributes: Object.fromEntries(
      Object.entries(el.attributes).filter(([name]) => !allowed.includes(name)),
    ),
  }));
}

/**
 * Mount one scenario in one framework, drive its steps, and hand back the whole
 * document body.
 *
 * The body rather than a subtree, because ids are numbered in document order
 * and a portalled popup lives outside whatever subtree is being compared —
 * numbering a fragment would renumber the same element differently in two
 * libraries that agree. Regions are selected afterwards, from the numbered
 * whole.
 */
interface Capture {
  html: string;
  /** Whether each `visibilityMatches` selector was actually painted. */
  visible: Record<string, boolean>;
}

async function run(page: Page, framework: Framework, scenario: BrowserScenario): Promise<Capture> {
  const errors: Error[] = [];
  const onError = (error: Error) => errors.push(error);
  page.on("pageerror", onError);

  await mountScenario(page, framework, scenario);

  for (const selector of scenario.hidden ?? []) {
    await expect
      .soft(page.locator(selector).first(), `${framework}: ${selector} is still visible`)
      .toBeHidden();
  }

  const visible: Record<string, boolean> = {};
  for (const selector of scenario.visibilityMatches ?? []) {
    visible[selector] = await page.locator(selector).first().isVisible();
  }

  page.off("pageerror", onError);
  expect(errors.map(String), `${framework} logged a page error`).toEqual([]);

  const html = await page.evaluate(() => {
    /**
     * The body, with its top-level children in a canonical order: the mount
     * point first, then every portalled surface sorted by what it *is*.
     *
     * `contractOf` numbers ids in document order, and the three renderers do
     * not agree on the order they append portals to `document.body` — with a
     * Select open inside a Dialog, React's popup lands before the dialog
     * content that owns it and Svelte's after. Left alone that renumbers every
     * id downstream, and reports markup that is identical as different: the
     * same positioner came out `#3` on one side and `#12` on the other.
     *
     * Sorting discards one real property — among surfaces at the same z-index,
     * later in the DOM paints on top. That is not lost, because the stacking
     * rule is asserted directly further down, against computed z-index, which
     * is how the shared stylesheet actually expresses it.
     */
    const key = (el: Element) => {
      const scoped = el.matches("[data-scope]") ? el : el.querySelector("[data-scope]");
      return scoped
        ? `${scoped.getAttribute("data-scope")}/${scoped.getAttribute("data-part")}`
        : el.tagName.toLowerCase();
    };
    const children = [...document.body.children].filter((el) => el.tagName !== "SCRIPT");
    const mount = children.filter((el) => el.id === "mount");
    const portalled = children.filter((el) => el.id !== "mount");
    portalled.sort((a, b) => key(a).localeCompare(key(b)));
    return [...mount, ...portalled].map((el) => el.outerHTML).join("");
  });

  return { html, visible };
}

for (const scenario of SCENARIOS) {
  test(`${scenario.component} / ${scenario.name}`, async ({ page }) => {
    const { exclude, allow = [], allowTextIn = [] } = scenario;
    const allowed = allow.map((a) => a.attribute);
    const textAllowed = allowTextIn.map((a) => a.selector);

    const compared = comparedIn(scenario);
    const captured = {} as Record<Framework, Capture>;
    for (const framework of ["react", ...compared] as Framework[]) {
      captured[framework] = await run(page, framework, scenario);
    }

    for (const selector of scenario.visibilityMatches ?? []) {
      for (const framework of compared) {
        expect
          .soft(
            captured[framework].visible[selector],
            `${framework}: ${selector} is painted where React's is not, or the reverse`,
          )
          .toBe(captured.react.visible[selector]);
      }
    }

    for (const region of scenario.regions) {
      const shape = (html: string) =>
        withoutAllowed(contractOf(html, region, exclude, textAllowed), allowed);

      const expected = shape(captured.react.html);
      // A region that matches nothing would compare two empty arrays and pass.
      expect(expected.length, `${region} matched nothing in the React output`).toBeGreaterThan(0);

      for (const framework of compared) {
        expect.soft(shape(captured[framework].html), `${framework} / ${region}`).toEqual(expected);
      }
    }

    // Held to the same standard as the SSR gate's: a text allowance claims the
    // element carrying the difference cannot be read, and that is checkable.
    for (const { selector, reason } of allowTextIn) {
      const readable = hiddenFromAssistiveTech(captured.react.html, selector);
      expect(
        readable,
        `${selector} is readable by assistive tech, so this text difference is NOT invisible. ${reason}`,
      ).toEqual([]);
    }

    // And an attribute allowance claims no stylesheet reads it.
    for (const { attribute, reason } of allow) {
      expect(
        scenario.stylesheets?.length,
        `${attribute} is allowed but no stylesheets are listed`,
      ).toBeGreaterThan(0);
      for (const sheet of scenario.stylesheets ?? []) {
        const css = readFileSync(join(CORE_SRC, sheet), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        expect(
          css,
          `${sheet} selects on ${attribute}, so this difference is NOT invisible. ${reason}`,
        ).not.toContain(`[${attribute}`);
      }
    }
  });
}

/**
 * The stacking rule, which is a computed style rather than an attribute and so
 * is the one thing here the contract comparison cannot see.
 *
 * Popover sits deliberately above Dialog, so a Select opened inside a Dialog
 * paints over its host instead of behind it. Zag implements that by writing an
 * inline z-index onto each positioner, read from the popup's own CSS rule — a
 * mechanism with no equivalent in Angular's CDK, whose overlays all share one
 * container. This is the assertion that port will have to satisfy.
 */
test("a Select inside a Dialog paints above it", async ({ page }) => {
  const SELECT = '[data-scope="select"][data-part="positioner"]';
  const DIALOG = '[data-scope="dialog"][data-part="positioner"]';
  const scenario = SCENARIOS.find((s) => s.component === "SelectInDialog")!;
  for (const framework of ["react", ...comparedIn(scenario)] as Framework[]) {
    await run(page, framework, scenario);

    /**
     * Both positioners start at `z-index: auto`: zag writes the value in an
     * effect after mount, by reading it off the popup's own rule. Reading before
     * that lands gives NaN, which is a flaky test rather than a finding.
     */
    const settled = (selectors: { select: string; dialog: string }) => {
      const z = (selector: string) => {
        const el = document.querySelector(selector);
        return el ? Number(getComputedStyle(el).zIndex) : NaN;
      };
      const pair = { select: z(selectors.select), dialog: z(selectors.dialog) };
      return Number.isFinite(pair.select) && Number.isFinite(pair.dialog) ? pair : null;
    };
    const handle = await page.waitForFunction(
      settled,
      { select: SELECT, dialog: DIALOG },
      {
        timeout: 5_000,
      },
    );
    const { select, dialog } = (await handle.jsonValue())!;

    expect(select, `${framework}: select z-index`).toBeGreaterThan(0);
    expect.soft(select, `${framework}: select must paint above dialog`).toBeGreaterThan(dialog);
  }
});

/**
 * The same stacking rule, in the one framework with no mechanism for it.
 *
 * Zag gives the other three libraries this for free: it writes the positioner's
 * `z-index` by reading the popup's own rule, so a popover opened inside a dialog
 * paints over it because `--z-index-popover` beats `--z-index-dialog`. The CDK
 * has no positioner. It parents every overlay to one container and stacks every
 * pane identically, so the same arrangement renders the popover *behind* its own
 * host — silently, with a perfectly correct DOM.
 *
 * This was the single largest risk in porting to Angular, and the plan called
 * for proving it before any component was written. `UioOverlayStacking`
 * reproduces zag's mechanism on the CDK pane; what follows is whether that is
 * enough.
 *
 * The levels are read from the stylesheet rather than written down here, so the
 * assertion is about the two surfaces' *relationship* — which is what the design
 * system actually promises — and moves with the tokens.
 */
test("Angular: a popover opened inside a dialog paints above it", async ({ page }) => {
  const POPOVER = '[data-scope="popover"][data-part="content"]';
  const DIALOG = '[data-scope="dialog"][data-part="content"]';

  await page.goto("/angular.html?component=PopoverInDialog&props=%7B%7D");
  await page.waitForSelector("html[data-parity-ready]", { state: "attached" });
  await page.locator('[data-scope="dialog"][data-part="trigger"]').click();
  await page.locator(DIALOG).waitFor({ timeout: 5_000 });
  await page.locator('[data-scope="popover"][data-part="trigger"]').click();
  await page.locator(POPOVER).waitFor({ timeout: 5_000 });

  const measured = await page.evaluate(
    ({ popoverSelector, dialogSelector }: { popoverSelector: string; dialogSelector: string }) => {
      const paneFor = (selector: string) => {
        const content = document.querySelector(selector);
        const pane = content?.closest(".cdk-overlay-pane");
        if (!pane) throw new Error(`no CDK pane around ${selector}`);
        return pane;
      };
      const zIndexOf = (element: Element) => Number(getComputedStyle(element).zIndex);
      const token = (name: string) =>
        Number(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

      const popover = document.querySelector(popoverSelector)!;
      const box = popover.getBoundingClientRect();
      const topmost = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);

      return {
        popoverPane: zIndexOf(paneFor(popoverSelector)),
        dialogPane: zIndexOf(paneFor(dialogSelector)),
        popoverToken: token("--z-index-popover"),
        dialogToken: token("--z-index-dialog"),
        // The property the user actually experiences, and the only one that
        // cannot be satisfied by a number that happens to be larger.
        popoverIsOnTop: !!topmost && popover.contains(topmost),
        // Recorded because it is *why* the line above holds. CDK 21 shows every
        // overlay in the browser's top layer, where stacking is by show order
        // and z-index between them does not apply. If that ever changes, the
        // levels below become load-bearing rather than merely correct — and
        // this is the assertion that will say so.
        topLayerSurfaces: document.querySelectorAll("[popover]").length,
      };
    },
    { popoverSelector: POPOVER, dialogSelector: DIALOG },
  );

  // Each pane takes the level its own popup's rule computed — no hardcoding, no
  // second copy of the scale.
  expect(measured.popoverPane, "popover pane").toBe(measured.popoverToken);
  expect(measured.dialogPane, "dialog pane").toBe(measured.dialogToken);
  expect(measured.popoverPane).toBeGreaterThan(measured.dialogPane);
  expect(measured.popoverIsOnTop, "the popover must be the element under the pointer").toBe(true);
  expect(measured.topLayerSurfaces, "CDK still shows overlays in the top layer").toBe(2);
});
