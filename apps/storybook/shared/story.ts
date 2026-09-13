/**
 * Shared story harness — the one place that knows how to find a story and wait
 * for it to settle.
 *
 * Every gate (visual, interaction, a11y, cross-browser smoke) drives the same
 * built `storybook-static` over `iframe.html?id=<storyId>`. That is deliberate:
 * a story id carries its own title, and a title maps to a docs slug, so each
 * gate produces per-component results without any new metadata to maintain.
 *
 * The settle sequence below was worked out by the visual gate and is the
 * fiddliest part of the whole harness — it is shared rather than copied so a
 * flake fixed once is fixed everywhere.
 */
import { expect, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface StoryEntry {
  id: string;
  type: string;
  name: string;
  title: string;
  tags?: string[];
  importPath?: string;
}

const INDEX_PATH = resolve(__dirname, "../storybook-static/index.json");

function readIndex(): Record<string, StoryEntry> {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(
      `No Storybook build found at ${INDEX_PATH}.\n` +
        `The gates run against a built Storybook, not a dev server. Build it first:\n` +
        `  pnpm --filter @ui-organized/storybook exec storybook build --quiet\n` +
        `or run the whole suite with \`pnpm quality\`, which builds it once for all gates.`,
    );
  }
  const index = JSON.parse(readFileSync(INDEX_PATH, "utf8")) as {
    entries: Record<string, StoryEntry>;
  };
  return index.entries;
}

/** Every story in the build. Docs pages (`type: "docs"`) are not stories. */
export function allStories(): StoryEntry[] {
  return Object.values(readIndex()).filter((e) => e.type === "story");
}

/**
 * One canonical story per component — the args-driven single instance every
 * story file re-tags with `dev` (see the `tags: ["!dev"]` convention in
 * apps/storybook/src/stories). Used where running all ~300 stories would be
 * disproportionate: the second and third browsers of the a11y gate.
 */
export function inspectStories(): StoryEntry[] {
  const isCanonical = (s: StoryEntry) => s.name === "Inspect" || (s.tags?.includes("dev") ?? false);

  const byTitle = new Map<string, StoryEntry>();
  for (const story of allStories()) {
    const chosen = byTitle.get(story.title);
    // A canonical story always wins; otherwise the first story of a title
    // stands in, so a component with no `Inspect` export is never silently
    // dropped from the gate.
    if (!chosen || (isCanonical(story) && !isCanonical(chosen))) {
      byTitle.set(story.title, story);
    }
  }
  return [...byTitle.values()];
}

/**
 * Navigate to a story and wait for it to be genuinely settled.
 *
 * Returns `false` when the story renders no visible content — a handful do so
 * intentionally (FieldError with an empty message, for instance) and should be
 * skipped rather than failed.
 */
export async function gotoStory(page: Page, id: string): Promise<boolean> {
  // viewMode=story → bare canvas; globals=theme:light → deterministic theme.
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:light`);
  const root = page.locator("#storybook-root");
  await root.waitFor({ state: "attached" });

  // Storybook has finished rendering (handles stories that render empty)…
  await page.waitForFunction(() => {
    const c = document.body.classList;
    return c.contains("sb-show-main") && !c.contains("sb-show-preparing");
  });
  // …the theme has actually been applied…
  //
  // `withThemeByDataAttribute` sets `data-theme` from a React effect, which
  // lands *after* Storybook reports the story as rendered. Every design token
  // is defined under `[data-theme]`, so anything measured before this point
  // sees the wrong palette entirely: the a11y gate read light-canvas pixels
  // against dark-theme text colours and reported 25 components as failing
  // contrast that are in fact fine. The visual gate hid the same race behind
  // `toHaveScreenshot`'s own retries, which is worse — it was never reliable,
  // it was just quiet about it.
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-theme") === "light",
    undefined,
    { timeout: 10_000 },
  );

  // …webfonts have settled, so text metrics are final…
  await page.evaluate(() => document.fonts.ready);

  // …and any entrance animation has finished.
  //
  // A component caught mid-transition is measured mid-transition. That showed up
  // as an intermittent contrast failure on WebKit: axe sampled a Tabs trigger
  // while the selection indicator was still sliding under it, computed the
  // contrast against a half-drawn background, and reported a violation that does
  // not exist in either the start or end state.
  //
  // Infinite animations (Marquee, Skeleton's shimmer, an indeterminate Progress)
  // never finish by definition, so they are filtered out rather than waited on,
  // and the whole thing is capped — settling is worth a moment, not a hang.
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return timing != null && timing.iterations !== Infinity;
    });
    await Promise.race([
      Promise.allSettled(finite.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  });

  // Wait for the root to actually lay out before judging emptiness — under
  // parallel load boundingBox can momentarily read 0 height, which would
  // otherwise spuriously skip a real story. Stories that intentionally render
  // nothing never gain size, so they time out here and are legitimately
  // reported as empty.
  return page
    .waitForFunction(
      () => {
        const el = document.querySelector("#storybook-root");
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      },
      undefined,
      { timeout: 3000 },
    )
    .then(() => true)
    .catch(() => false);
}

/**
 * Console messages that describe the test rig rather than the component.
 *
 * A browser logs a failed resource fetch as a console error, so the local static
 * server dropping a connection under parallel load looks identical to an
 * application bug — and failed the smoke gate on WebKit for a Button that is
 * perfectly fine.
 *
 * Only *transport* failures are ignored. A 404 is deliberately NOT in here: a
 * component pointing at an asset that does not exist is a real bug, and it is
 * one of the more useful things this gate can catch.
 */
const INFRASTRUCTURE_NOISE = [
  /Could not connect to the server/i,
  /net::ERR_(CONNECTION|NETWORK|EMPTY_RESPONSE|SOCKET)/i,
  /Load failed$/i,
];

/**
 * Assert a story rendered without the app throwing. Shared by the smoke gate
 * and used as a precondition by the interaction specs.
 */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (INFRASTRUCTURE_NOISE.some((pattern) => pattern.test(text))) return;
    errors.push(`console.error: ${text}`);
  });
  return errors;
}

/** Open a story and fail loudly if it did not render. */
export async function openStory(page: Page, id: string): Promise<void> {
  const laidOut = await gotoStory(page, id);
  expect(laidOut, `story ${id} rendered no visible content`).toBe(true);
}
