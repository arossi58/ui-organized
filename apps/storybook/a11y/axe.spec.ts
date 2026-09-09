import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { allStories, gotoStory, type StoryEntry } from "../shared/story";

/**
 * Gate 3 — accessibility. axe-core over every story, on the real rendered DOM.
 *
 * This is the counterpart to the `jsx-a11y` rules in the lint gate, not a
 * replacement for them. jsx-a11y reads source and catches violations in code no
 * story exercises; axe reads the rendered a11y tree and catches everything
 * static analysis can't see — computed contrast, ARIA references that resolve to
 * nothing, focus order. Neither subsumes the other.
 *
 * Scanned at document level rather than `#storybook-root`, deliberately: Ark's
 * overlays portal to <body>, so a root-scoped scan would audit every component
 * *except* the dialogs, menus and popovers where ARIA is hardest to get right.
 */

/**
 * Rules that only mean something for a whole page. A story canvas is a fragment
 * — it has no <main>, no <h1> and no title, and it should not pretend to.
 * Disabling them here is not lowering the bar; the marketing site's own pages
 * are where those rules belong.
 */
const PAGE_LEVEL_RULES = [
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "html-has-lang",
  "document-title",
  "bypass",
];

/**
 * Known, accepted violations — each one a deliberate decision recorded
 * elsewhere, not a bug waiting to be fixed.
 *
 * Keyed by story-id prefix (so it covers every story of a component). A match
 * is *recorded* as a known exception rather than silently dropped: it still
 * appears in the report and on the docs page, it just doesn't fail the gate.
 *
 * Adding an entry here should be an argued decision. The bar is "we chose this
 * and here is where that choice is written down", never "this was red and we
 * needed CI green".
 */
const ACCEPTED: Array<{ storyPrefix: string; rule: string; because: string }> = [
  {
    storyPrefix: "components-data-display-tag",
    rule: "color-contrast",
    because:
      "Emphasized Tag labels knowingly fall short of AA. This is a palette-level " +
      "decision about the status colours, not a component defect — patching it in " +
      "Tag.css would desynchronise the component from the token it is meant to show.",
  },
  {
    storyPrefix: "components-actions-toggle",
    rule: "color-contrast",
    because:
      "The selected Toggle knob knowingly falls short of AA, for the same " +
      "palette-level reason as the Tag labels above.",
  },
  {
    storyPrefix: "components-forms-range--states",
    rule: "color-contrast",
    because:
      "The failing text is inside the *disabled* Range, which dims the whole " +
      "control with `opacity: 0.4` (Range.css). WCAG 1.4.3 exempts text that is " +
      "part of an inactive user interface component, and axe cannot tell that a " +
      "<span> beside a disabled slider is inactive — it only sees the composited " +
      "colour. Raising the disabled opacity to satisfy the checker would make " +
      "disabled look enabled, which is the worse outcome.",
  },
];

/**
 * The adoption baseline: violations that exist **today** and are not yet fixed.
 *
 * This is not the same thing as ACCEPTED above, and the difference matters.
 * ACCEPTED is a decision. This is a debt register — every entry is a real bug
 * that someone still has to fix.
 *
 * It exists because turning on a strict gate over a codebase that has never had
 * one leaves you two bad options: block every merge until the whole backlog is
 * cleared, or don't turn the gate on. The baseline gives a third: **new**
 * violations fail immediately, while the existing ones stay recorded, counted,
 * and visible on each component's docs page and on /quality — so the backlog
 * shrinks under sunlight instead of being quietly forgotten.
 *
 * Regenerate with `node scripts/quality/a11y-baseline.mjs` — and only ever to
 * record a fix. Adding to it to get a red build green is the one thing this
 * mechanism must not be used for.
 */
const BASELINE: Record<string, string[]> = JSON.parse(
  readFileSync(resolve(__dirname, "known-violations.json"), "utf8"),
).violations;

function baselinedFor(storyId: string, ruleId: string) {
  return BASELINE[storyId]?.includes(ruleId) ?? false;
}

function acceptedFor(storyId: string, ruleId: string) {
  return ACCEPTED.find((a) => storyId.startsWith(a.storyPrefix) && a.rule === ruleId);
}

/**
 * Run axe, retrying the one collision that is not our bug.
 *
 * Storybook's own `addon-a11y` bundles axe-core and scans each story as it
 * renders. axe refuses to run twice concurrently, so our scan intermittently
 * hits "Axe is already running" — most often on Firefox, where the slower render
 * widens the overlap. It affected a third of the suite there and none of it on
 * Chromium, which is exactly the shape of a race rather than a finding.
 *
 * Storybook 10's `parameters.a11y.manual` does not stop the addon's scan, so
 * rather than fight a moving internal API this waits for the addon's run to
 * finish and tries again. The error is specific and transient; any other error
 * still propagates, so a genuinely broken scan fails loudly.
 */
async function runAxe(page: Page) {
  const ATTEMPTS = 5;
  let lastError: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      return await new AxeBuilder({ page }).disableRules(PAGE_LEVEL_RULES).analyze();
    } catch (error) {
      if (!/Axe is already running/i.test(String(error))) throw error;
      lastError = error;
      await page.waitForTimeout(200 * (attempt + 1));
    }
  }
  throw lastError;
}

const isCanonical = (s: StoryEntry) => s.name === "Inspect" || (s.tags?.includes("dev") ?? false);

for (const story of allStories()) {
  // The `@canonical` tag is what the Firefox and WebKit projects grep for: they
  // audit one story per component rather than all ~300. The markup is identical
  // across engines — only the computed a11y tree differs — so a second and third
  // full pass mostly re-finds the same violations at triple the cost.
  const title = isCanonical(story) ? `${story.id} @canonical` : story.id;

  test(title, async ({ page }, testInfo) => {
    const laidOut = await gotoStory(page, story.id);
    test.skip(!laidOut, "renders no visible content");

    const results = await runAxe(page);

    const accepted: typeof results.violations = [];
    const known: typeof results.violations = [];
    const real: typeof results.violations = [];
    for (const violation of results.violations) {
      if (acceptedFor(story.id, violation.id)) accepted.push(violation);
      else if (baselinedFor(story.id, violation.id)) known.push(violation);
      else real.push(violation);
    }

    // Attached rather than only asserted, so the aggregator can read the detail
    // straight out of the Playwright JSON report and put it on the docs page.
    // Attaching on pass as well as failure is the point: a component with zero
    // violations still needs to say so.
    await testInfo.attach("axe", {
      contentType: "application/json",
      body: JSON.stringify({
        storyId: story.id,
        title: story.title,
        violations: real.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
          target: v.nodes[0]?.target?.join(" ") ?? "",
        })),
        accepted: accepted.map((v) => ({
          id: v.id,
          nodes: v.nodes.length,
          because: acceptedFor(story.id, v.id)?.because,
        })),
        // Reported, not hidden: these are the open bugs, and the docs page and
        // /quality dashboard render them as such.
        known: known.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      }),
    });

    expect(
      real,
      real.length
        ? `axe found ${real.length} violation(s) in ${story.id}:\n` +
            real
              .map(
                (v) =>
                  `  · [${v.impact}] ${v.id} — ${v.help}\n` +
                  `    ${v.nodes.length} node(s), first: ${v.nodes[0]?.target?.join(" ")}\n` +
                  `    ${v.helpUrl}`,
              )
              .join("\n")
        : "",
    ).toEqual([]);
  });
}
