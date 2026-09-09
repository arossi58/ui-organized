import { test, expect, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { type BrowserScenario } from "./scenarios/index.js";
import { audited, comparedIn, mountScenario, type Framework } from "./mount.js";

/**
 * Do the four libraries *look* the same, not just describe themselves the same?
 *
 * The parity gate proves their DOM matches attribute for attribute, and it is
 * tempting to stop there. What it cannot see is CSS: markup carries the class
 * names, not the rules they resolve to. Three things break with the DOM
 * untouched —
 *
 *   - a stylesheet that fails to load at all in one library's build,
 *   - Svelte's and Vue's **scoped styles**, which each add or withhold rules by
 *     a mechanism the other two do not have,
 *   - a font or asset that resolves in one bundler's output and not another's.
 *
 * Each of those renders a component that passes every markup assertion and looks
 * wrong, which is the exact failure a design system exists to prevent.
 *
 * ── Against React, in the same run ──────────────────────────────────────────
 *
 * No committed baselines. Three more `__screenshots__` directories would mean
 * every deliberate design change regenerating four sets of images instead of
 * one, and a diff nobody reads is a diff nobody trusts. Instead React is
 * screenshotted in the same run, in the same browser, at the same viewport, and
 * the others are compared against it. A difference is then unambiguous: the same
 * engine drew both, so the pixels came from the CSS.
 *
 * That does mean a change all four make together is invisible here — which is
 * correct. `apps/storybook`'s visual gate is where React's own appearance is
 * pinned against committed baselines; this one answers "did the ports drift".
 *
 * Advisory, like its Storybook counterpart. Antialiasing at a subpixel boundary
 * is not a defect, and a gate that blocks a merge over it teaches people to
 * ignore it.
 */

/**
 * Differences that are decided, not undiscovered.
 *
 * Each entry names one library, one scenario, and why the two are allowed to
 * look different. The bar is the same as the a11y gate's `ACCEPTED`: "we chose
 * this and here is where that choice is written down", never "this was red and
 * we needed CI green". An entry still shows in the report — it just does not
 * count as drift.
 */
const ACCEPTED: Array<{ component: string; scenario: string; framework: string; because: string }> =
  [
    {
      component: "Toast",
      scenario: "created",
      framework: "angular",
      because:
        "Zag stacks toasts by positioning each one absolutely and driving `--y`, " +
        "`--offset` and `--index` from measured heights through a ResizeObserver. " +
        "None of those variables appear in `Toast.css`, so the Angular port builds " +
        "the same bottom-end placement out of a flex column instead — a deliberate " +
        "choice recorded in `packages/angular/src/lib/toast/toast.ts`. The two do " +
        "not look the same, though, and that comment says they do: React collapses " +
        "the stack (both toasts at the same y, front one visible) and Angular lays " +
        "them out in flow. Recorded here rather than quietly tolerated — the " +
        "choreography is real work, and it is not §F's.",
    },
    {
      component: "SignaturePad",
      scenario: "cleared",
      framework: "angular",
      because:
        "Angular is the one that is *right* here, which is worth stating plainly: " +
        "React is the reference for parity, not the arbiter of correctness. " +
        "Clicking Clear hides the clear trigger, and React lets focus fall to " +
        "`<body>` — the focus-loss anti-pattern — while Angular moves it to the pad, " +
        "which draws the focus ring these pixels differ by. Fixing React is a " +
        "behaviour change to a shipped package and belongs in its own change.",
    },
  ];

/**
 * How much difference is still "the same picture".
 *
 * `threshold` is pixelmatch's per-pixel colour tolerance — 0.1 is its own
 * recommended default and forgives antialiasing at an edge without forgiving a
 * changed colour. `MAX_DIFF_RATIO` is how many pixels may differ at all: a
 * quarter of one percent, which covers a few hundred edge pixels on a
 * 1280×800 mount and nothing that would read as a visual difference.
 */
const PIXEL_THRESHOLD = 0.1;
const MAX_DIFF_RATIO = 0.0025;

/**
 * Stop every transition before the shutter.
 *
 * Same reasoning as the a11y gate's `settle()`, and it matters more here: a
 * screenshot taken mid-transition captures a frame the design never specifies,
 * and two libraries whose animations start a millisecond apart would differ
 * every run for no reason at all.
 */
async function settle(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }`,
  });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

/**
 * The whole viewport, not `#mount`.
 *
 * Every library portals its overlays to `<body>`, so a mount-scoped shot would
 * miss exactly the surfaces most likely to differ — an open menu, a dialog, a
 * popover. The page background is identical across the four by construction
 * (`harness.css`), so including it costs nothing.
 */
async function shoot(
  page: Page,
  framework: Framework,
  scenario: BrowserScenario,
): Promise<Buffer> {
  await mountScenario(page, framework, scenario);
  await settle(page);
  return page.screenshot({ animations: "disabled", caret: "hide" });
}

for (const scenario of audited()) {
  const others = comparedIn(scenario);
  if (!others.length) continue;

  test(`${scenario.component} / ${scenario.name}`, async ({ page }, testInfo) => {
    const reference = PNG.sync.read(await shoot(page, "react", scenario));

    const drifted: string[] = [];
    for (const framework of others) {
      const candidate = PNG.sync.read(await shoot(page, framework, scenario));

      // Different dimensions mean a layout difference, which is a finding in
      // itself and which pixelmatch cannot express — it requires equal sizes.
      if (candidate.width !== reference.width || candidate.height !== reference.height) {
        drifted.push(
          `${framework}: rendered ${candidate.width}×${candidate.height} against React's ` +
            `${reference.width}×${reference.height}`,
        );
        continue;
      }

      const diff = new PNG({ width: reference.width, height: reference.height });
      const changed = pixelmatch(
        reference.data,
        candidate.data,
        diff.data,
        reference.width,
        reference.height,
        { threshold: PIXEL_THRESHOLD },
      );
      const ratio = changed / (reference.width * reference.height);
      if (ratio <= MAX_DIFF_RATIO) continue;

      const decision = ACCEPTED.find(
        (a) =>
          a.component === scenario.component &&
          a.scenario === scenario.name &&
          a.framework === framework,
      );
      if (decision) {
        await testInfo.attach(`${framework}-accepted`, {
          contentType: "application/json",
          body: JSON.stringify({
            framework,
            pixels: changed,
            percent: Number((ratio * 100).toFixed(2)),
            because: decision.because,
          }),
        });
        continue;
      }

      drifted.push(`${framework}: ${changed} pixels differ (${(ratio * 100).toFixed(2)}%)`);
      // Attached only when it failed — three images per scenario per run would
      // bury the report, and a passing comparison has nothing to look at.
      await testInfo.attach(`${framework}-diff`, {
        contentType: "image/png",
        body: PNG.sync.write(diff),
      });
      await testInfo.attach(`${framework}-actual`, {
        contentType: "image/png",
        body: PNG.sync.write(candidate),
      });
      await testInfo.attach("react-expected", {
        contentType: "image/png",
        body: PNG.sync.write(reference),
      });
    }

    expect(
      drifted,
      drifted.length
        ? `${scenario.component} / ${scenario.name} does not look like React's:\n` +
            drifted.map((line) => `  · ${line}`).join("\n")
        : "",
    ).toEqual([]);
  });
}
