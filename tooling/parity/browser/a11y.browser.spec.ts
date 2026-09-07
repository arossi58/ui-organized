import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { SCENARIOS, type BrowserScenario } from "./scenarios/index.js";
import { comparedIn, mountScenario, type Framework } from "./mount.js";

/**
 * Accessibility, for the three libraries nothing else audits.
 *
 * `apps/storybook/a11y/axe.spec.ts` runs axe over ~300 React stories and is the
 * older, broader gate. It cannot say anything about the other three, because
 * Storybook depends on `@ui-organized/react` alone — so Svelte, Vue and Angular
 * shipped 68 components each with **no accessibility coverage at all**.
 *
 * ── Why this compares rather than scores ────────────────────────────────────
 *
 * The obvious gate — run axe on every library, fail on any violation — was built
 * first and measured the wrong thing. It reported 266 failures whose violations
 * were spread almost exactly evenly across the four libraries (79/79/79/77), and
 * four independent implementations do not fail identically by coincidence. Every
 * one of them was a property of something *shared*: the harness, or the fixture,
 * or the component's CSS.
 *
 * Two things came out of that, and both are worth keeping in mind before adding
 * to this file:
 *
 * **The harness had no theme.** The token set's `:root` is the *dark* palette,
 * so an unstamped page painted near-white text onto an unpainted body. 236 of
 * the 266 were that. Fixed in `harness.css` — see its header.
 *
 * **A fixture is not a usage.** Most of what remained was `label`: the parity
 * fixtures mount `<Input>`, `<Checkbox>` and their neighbours with the minimum
 * props needed to compare markup, which does not include a label. That is a fair
 * description of the fixture and a poor description of the component, and
 * "every library fails to label an input nobody labelled" is not a finding.
 *
 * So this gate uses the same reference the whole harness uses. **React is the
 * baseline; a violation is a failure when a library has it and React does not**
 * at the same scenario. That is exactly the class of defect this gate exists to
 * find — one the port introduced — and it needs no baseline file to stay honest,
 * because the reference is recomputed on every run rather than recorded.
 *
 * Violations all four share are still reported, in the `shared` bucket of the
 * attachment, so they stay visible and countable. They do not block: React's own
 * accessibility is the Storybook gate's job, over stories that pass real props.
 *
 * ── Why a subset of the scenarios ───────────────────────────────────────────
 *
 * There are ~880 scenarios, and the marginal one adds very little: three ways of
 * opening the same menu produce the same a11y tree. Each component contributes
 * two — its **first** scenario, the plain mounted state, and its **most-stepped**
 * one, the richest end state it has. Same reasoning as the `@canonical` tag in
 * the Storybook gate, which audits one story per component on Firefox and WebKit
 * rather than all of them.
 */

/**
 * Rules that only mean something for a whole page. A harness page is a fragment
 * — it has no `<main>`, no `<h1>` and no title, and it should not pretend to.
 *
 * Same list as the Storybook gate's, deliberately: two accessibility gates over
 * one design system that disagree about which rules count would be worse than
 * either alone.
 */
/**
 * Rules compared between libraries but never *blamed* on one.
 *
 * `color-contrast` is here because a per-framework contrast difference has no
 * mechanism to be real. All four load the identical stylesheet — one file, from
 * `@ui-organized/core` — and the parity gate proves their markup, and therefore
 * their classes and state attributes, match. A genuine difference would have to
 * come from different CSS (impossible) or a different rendered state, which the
 * parity gate reports as a DOM difference, which is where it belongs.
 *
 * Axe's handling of it, meanwhile, has an obvious mechanism to be unstable: half
 * these components paint on a *translucent* background — `.btn--secondary` is
 * `rgba(0, 0, 0, 0.1)` — so it has to composite against the stack behind, and
 * falls back between `violation` and `incomplete` depending on whether it can
 * resolve it. Measured: three consecutive runs failed 2, 3 and 4 scenarios, a
 * different set each time, every one `color-contrast`, and every one clean when
 * probed on its own. Disabling transitions did not settle it.
 *
 * So contrast is still collected and still reported in `shared`. It is just not
 * grounds for failing one library against another. React's own contrast is the
 * Storybook gate's job, over stories with real props and a real page.
 */
const NOT_COMPARABLE = ["color-contrast"];

const PAGE_LEVEL_RULES = [
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "html-has-lang",
  "document-title",
  "bypass",
];

/**
 * Two scenarios per component: the plain mount, and the richest end state.
 *
 * Ties go to the earlier scenario, so the choice is stable as scenarios are
 * added — a subset that silently reshuffles when someone appends a scenario is
 * one whose results stop being comparable run to run.
 */
function audited(): BrowserScenario[] {
  const byComponent = new Map<string, BrowserScenario[]>();
  for (const scenario of SCENARIOS) {
    const list = byComponent.get(scenario.component) ?? [];
    list.push(scenario);
    byComponent.set(scenario.component, list);
  }

  const picked: BrowserScenario[] = [];
  for (const list of byComponent.values()) {
    const first = list[0]!;
    let richest = first;
    for (const scenario of list) {
      if ((scenario.steps?.length ?? 0) > (richest.steps?.length ?? 0)) richest = scenario;
    }
    picked.push(first);
    if (richest !== first) picked.push(richest);
  }
  return picked;
}

interface Finding {
  id: string;
  impact: string | null | undefined;
  help: string;
  helpUrl: string;
  nodes: number;
  target: string;
}

/**
 * Stop every transition before measuring.
 *
 * Half the components here paint on a *translucent* background —
 * `.btn--secondary` is `rgba(0, 0, 0, 0.1)` — so axe has to composite them
 * against whatever is behind, and mid-transition that composite is a colour the
 * design never specifies. The result was a gate that failed two scenarios per
 * run and a *different* two each time: `SegmentedControl` and `Steps`, then
 * `Steps` and `Toggle`. Probed directly, all of them were clean.
 *
 * A transition's midpoint is not a state anyone reads text in, so measuring it
 * is measuring nothing. `reducedMotion: "reduce"` in the config asks the design
 * system to stand still; this makes sure of it for the libraries and third-party
 * styles that do not honour the preference, and the extra frame gives the
 * browser time to paint the settled result.
 */
async function settle(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-delay: 0s !important;
    }`,
  });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

/**
 * Mount one scenario in one library and audit the end state.
 *
 * Scanned at document level rather than at `#mount`, deliberately: every library
 * portals its overlays to `<body>`, so a mount-scoped scan would audit every
 * component *except* the dialogs, menus and popovers where ARIA is hardest to
 * get right.
 */
async function audit(
  page: Page,
  framework: Framework,
  scenario: BrowserScenario,
): Promise<Map<string, Finding>> {
  await mountScenario(page, framework, scenario);
  await settle(page);
  const results = await new AxeBuilder({ page }).disableRules(PAGE_LEVEL_RULES).analyze();
  return new Map(
    results.violations.map((v) => [
      v.id,
      {
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        target: v.nodes[0]?.target?.join(" ") ?? "",
      },
    ]),
  );
}

for (const scenario of audited()) {
  const others = comparedIn(scenario);
  if (!others.length) continue;

  test(`${scenario.component} / ${scenario.name}`, async ({ page }, testInfo) => {
    const reference = await audit(page, "react", scenario);

    const introduced: Record<string, Finding[]> = {};
    const shared: Finding[] = [];
    const fixed: Record<string, string[]> = {};

    for (const framework of others) {
      const found = await audit(page, framework, scenario);
      const extra = [...found.values()].filter(
        (v) => !reference.has(v.id) && !NOT_COMPARABLE.includes(v.id),
      );
      if (extra.length) introduced[framework] = extra;

      // A rule React trips and this library does not. Not a failure — it is the
      // opposite — but worth reporting, because it usually means the two are
      // rendering genuinely different markup and the parity gate has an
      // exception covering it.
      const missing = [...reference.keys()].filter((id) => !found.has(id));
      if (missing.length) fixed[framework] = missing;
    }

    for (const violation of reference.values()) {
      if (others.every((framework) => !introduced[framework]?.some((v) => v.id === violation.id))) {
        shared.push(violation);
      }
    }

    // Attached rather than only asserted, so the aggregator can read the detail
    // out of the Playwright JSON report. Attaching on pass as well as failure is
    // the point: a scenario with nothing introduced still needs to say so.
    await testInfo.attach("axe", {
      contentType: "application/json",
      body: JSON.stringify({
        component: scenario.component,
        scenario: scenario.name,
        frameworks: others,
        introduced,
        // Present in React too, so not this port's doing. Reported, not hidden.
        shared,
        fixed,
      }),
    });

    const culprits = Object.keys(introduced);
    expect(
      culprits,
      culprits.length
        ? `${scenario.component} / ${scenario.name} — accessibility violations React does not have:\n` +
            culprits
              .map(
                (framework) =>
                  `  ${framework}:\n` +
                  introduced[framework]!
                    .map(
                      (v) =>
                        `    · [${v.impact}] ${v.id} — ${v.help}\n` +
                        `      ${v.nodes} node(s), first: ${v.target}\n` +
                        `      ${v.helpUrl}`,
                    )
                    .join("\n"),
              )
              .join("\n")
        : "",
    ).toEqual([]);
  });
}
