import { type Page } from "@playwright/test";
import { ANGULAR_COMPONENTS, type BrowserScenario } from "./scenarios/index.js";

/**
 * Mounting a scenario, shared by every gate that drives one.
 *
 * The parity gate captures the DOM afterwards; the a11y gate runs axe against
 * the live page. What happens *before* that — navigate the right page, wait for
 * the mount, replay the steps, name the framework in every failure — is the same
 * work, and it was the expensive half to get right.
 *
 * Kept here rather than exported from `parity.browser.spec.ts` because a spec
 * file that another spec imports runs its own tests twice.
 */

export const FRAMEWORKS = ["react", "svelte", "vue", "angular"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

/**
 * React is the reference; every other library is compared against it rather
 * than against each other, so a divergence names one culprit instead of two.
 * Angular joins only for what it has implemented — a scenario it cannot render
 * yet is compared across the other three rather than skipped.
 */
export function comparedIn(scenario: BrowserScenario): Framework[] {
  const others: Framework[] = ["svelte", "vue"];
  if (ANGULAR_COMPONENTS.has(scenario.component)) others.push("angular");
  const skipped = new Set((scenario.skip ?? []).map((entry) => entry.framework));
  return others.filter((framework) => !skipped.has(framework));
}

/** Every library that can render this scenario at all, React included. */
export function renderedIn(scenario: BrowserScenario): Framework[] {
  return ["react", ...comparedIn(scenario)];
}

/**
 * React spells the class prop `className`; every other library spells it
 * `class`.
 *
 * Scenarios are written in React's spelling because React is the reference, so
 * the rename happens here rather than in the pages — the same rename the SSR
 * gate does, and for the same reason: each side should receive only its own
 * spelling, so none of them gets a stray unknown prop.
 */
export function inDialect(
  props: Record<string, unknown>,
  framework: Framework,
): Record<string, unknown> {
  if (framework === "react" || !("className" in props)) return props;
  const { className, ...rest } = props;
  return { ...rest, class: className };
}

/**
 * Navigate to one framework's page, mount the scenario, and replay its steps.
 *
 * Every failure names the framework. Without it, a step that only one library
 * fails to reach reports as an anonymous timeout and finding out which of the
 * four it was means running them by hand.
 */
export async function mountScenario(
  page: Page,
  framework: Framework,
  scenario: BrowserScenario,
): Promise<void> {
  const props = encodeURIComponent(JSON.stringify(inDialect(scenario.props ?? {}, framework)));
  await page.goto(`/${framework}.html?component=${scenario.component}&props=${props}`);
  try {
    await page.waitForSelector("html[data-parity-ready]", { state: "attached", timeout: 10_000 });
  } catch (cause) {
    // Without the framework in the message this reads as "the harness is
    // broken" when it means "one of four pages did not mount".
    throw new Error(`${framework}: ${scenario.component} never finished mounting`, { cause });
  }

  for (const step of scenario.steps) {
    try {
      if (step.do === "click") await page.locator(step.target).first().click({ timeout: 5_000 });
      else if (step.do === "focus")
        await page.locator(step.target).first().focus({ timeout: 5_000 });
      else if (step.do === "hover")
        await page.locator(step.target).first().hover({ timeout: 5_000 });
      else if (step.do === "press") await page.keyboard.press(step.key);
      else if (step.do === "awaitFocus")
        await page.waitForFunction(
          (selector) => {
            const active = document.activeElement;
            return !!active && (active.matches(selector) || !!active.closest(selector));
          },
          step.target,
          { timeout: 5_000 },
        );
      // Short, so a state that never arrives reports as itself rather than as
      // the whole test running out of time 25 seconds later.
      else await page.locator(step.target).first().waitFor({ state: "attached", timeout: 5_000 });
    } catch (cause) {
      throw new Error(`${framework}: step ${JSON.stringify(step)} did not complete`, { cause });
    }
  }
}
