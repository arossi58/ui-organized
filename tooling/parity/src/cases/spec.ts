import type { ComponentType, ReactElement } from "react";

/**
 * The shape of a case module, and the handful of values every one of them uses.
 *
 * Split out from the modules themselves so that adding a component means adding
 * one file and touching nothing shared — see `index.ts` for how they are
 * collected.
 */

/**
 * One entry per component, one row per state worth pinning.
 *
 * `react` builds the element; `svelte` is a fixture component that renders the
 * Svelte equivalent with the same children. Fixtures exist because snippets
 * cannot be written by hand outside a component — which is fine, since a fixture
 * is also exactly what a consumer writes.
 *
 * `props` are passed to both. The two libraries spell the class prop
 * differently, so `className` is rewritten to `class` for the Svelte side rather
 * than being listed twice in every case.
 */
export interface ParityCase {
  name: string;
  props?: Record<string, unknown>;
}

/**
 * An attribute that legitimately differs between libraries, and why.
 *
 * These are not suppressions. Each one is checked against the component's own
 * stylesheet, and an allowance for an attribute the CSS actually selects on is
 * itself a failure — so an allowance can never hide the bug this suite exists to
 * catch. The rule is: if the stylesheet does not read it, the difference is
 * invisible and can wait; if it does, it is a real defect however plausible the
 * explanation.
 */
export interface ParityAllowance {
  attribute: string;
  reason: string;
}

/**
 * A *text* difference that cannot reach a user, because the element carrying it
 * is hidden from assistive technology.
 *
 * Held to the same standard as an attribute allowance: the claim is checked, not
 * trusted. Every element the selector matches must carry `aria-hidden="true"` in
 * the reference output, and the assertion fails if one does not. Text a screen
 * reader can read is not covered by this and never should be.
 */
export interface ParityTextAllowance {
  selector: string;
  reason: string;
}

export interface ParitySpec {
  component: string;
  react: (props: Record<string, any>) => ReactElement;
  svelte: ComponentType<any>;
  /**
   * The Vue fixture. Optional while the Vue port is in progress — a spec without
   * one is simply not compared against Vue, rather than failing, so React and
   * Svelte stay covered as Vue catches up.
   */
  vue?: ComponentType<any>;
  cases: ParityCase[];
  /** Stylesheets in @ui-organized/core this component's contract depends on. */
  stylesheets?: string[];
  allow?: ParityAllowance[];
  allowTextIn?: ParityTextAllowance[];
  /**
   * Limit the comparison to one subtree.
   *
   * Only portalled components need this, and they need it for a reason worth
   * writing down: **the two Ark packages disagree about what a Portal does under
   * SSR.** Ark React renders portalled content inline — there is no DOM to
   * portal into on the server — so a closed Popover still emits its positioner,
   * content, title, description and close button. Ark Svelte renders nothing at
   * all.
   *
   * Neither is wrong and neither is visible: the content is `hidden` with
   * `data-state="closed"` either way, and it is created by the client before it
   * can ever be seen. React even warns that its own `useLayoutEffect`
   * positioning does not run on the server, so the placement it renders is not
   * the placement a user gets.
   *
   * Static rendering therefore cannot say anything true about portalled content,
   * and pretending otherwise would mean either a permanently red gate or an
   * allowance broad enough to hide real bugs. What it *can* compare is the part
   * that is not portalled — the trigger, which is where `aria-controls`,
   * `aria-expanded` and `data-state` live. The portalled half belongs to the
   * Playwright harness, which opens the overlay in a real browser.
   */
  select?: string;
  /**
   * Drop a subtree before comparing. The counterpart to `select`, for when the
   * portal sits *inside* the part worth comparing — Select's popup is a
   * descendant of the field that also holds its label, helper text and hidden
   * native control, so selecting the field cannot exclude the popup.
   */
  exclude?: string;
}

export const SIZES = ["sm", "md", "lg"] as const;
