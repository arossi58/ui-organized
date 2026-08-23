import type { ParityAllowance, ParityTextAllowance } from "../../src/cases/spec.js";

/**
 * The shape of a scenario module, and the handful of helpers every one of them
 * uses.
 *
 * Split out from the modules themselves so that adding a component means adding
 * one file and touching nothing shared — see `index.ts` for how they are
 * collected.
 */

/**
 * The half of the contract static rendering cannot see.
 *
 * Three things are invisible to the SSR gate, and between them they cover the
 * components most likely to break:
 *
 *  - **Portalled content.** Ark React renders a portal inline on the server,
 *    Ark Svelte renders nothing, and Vue teleports — so a closed Popover's
 *    markup is three different things, none of them what a user gets. The SSR
 *    gate therefore compares triggers only, and every popup, listbox, menu and
 *    dialog surface in the library goes unchecked.
 *  - **Interactive state.** `[data-state="open"]`, `[data-highlighted]`,
 *    `[data-focus]` — the attributes most of the stylesheet actually selects on
 *    — exist only after something has been clicked.
 *  - **Toasts.** Nothing renders until one is created.
 *
 * A step list rather than per-framework driving code, because the point is that
 * all three get *the same* interaction. A helper that clicks "the trigger" in
 * each library would be three implementations of the thing under test.
 */
export type Step =
  | { do: "click"; target: string }
  | { do: "hover"; target: string }
  | { do: "press"; key: string }
  | { do: "wait"; target: string }
  /**
   * Wait until focus is inside `target`.
   *
   * The precondition every keyboard step actually needs, and the one
   * `data-state="open"` does not give. Ark React moves focus into a menu in the
   * same tick it opens it; Ark Svelte and Ark Vue move it a tick later, so a
   * keypress sent the instant the state flips lands on `document.body` and is
   * lost. Without this the two libraries looked broken — and worse, the case
   * passed for a while by all three highlighting nothing.
   */
  | { do: "awaitFocus"; target: string };

export interface BrowserScenario {
  /** A key in BROWSER_SPECS. */
  component: string;
  name: string;
  props?: Record<string, unknown>;
  steps: Step[];
  /**
   * Subtrees to compare, each independently.
   *
   * Ids are numbered across the whole captured document before a region is
   * selected, so a region may reference an id outside itself — a trigger's
   * `aria-controls` still resolves to the portalled content it names.
   */
  regions: string[];
  /**
   * Selectors that must not be *visible* in any framework.
   *
   * `data-state="closed"` is not the same claim. A popup whose rule sets
   * `display` overrides the `hidden` attribute Ark puts on it and stays laid
   * out — and therefore stays in the accessibility tree — with a perfectly
   * correct closed state on it. Only the browser can tell the difference,
   * which is the whole reason this gate exists.
   */
  hidden?: string[];
  /**
   * Selectors whose visibility must merely *match React's*.
   *
   * The weaker claim, for where all three libraries agree and the shared
   * stylesheet is what is wrong. That is a finding about the design system
   * rather than about a port, and this gate is not the place to assert it —
   * but the three still have to agree, and a Svelte popup that stayed painted
   * where React's did not would still fail here.
   */
  visibilityMatches?: string[];
  exclude?: string;
  /**
   * Libraries this scenario does not apply to, with the reason.
   *
   * Not a suppression: the entry has to name a difference that is real rather
   * than a bug. There is exactly one so far — the directly-supplied icon, where
   * React hands `Icon` a component that maps its own props and Angular hands it
   * markup, so the two cannot render the same attributes by construction.
   */
  skip?: { framework: string; reason: string }[];
  stylesheets?: string[];
  allow?: ParityAllowance[];
  allowTextIn?: ParityTextAllowance[];
}

/**
 * The components the Angular library implements so far.
 *
 * Angular is compared in the browser only — see `fixtures/angular/index.ts` —
 * so a scenario is the *only* way an Angular component gets compared at all.
 * That is why `Button` has browser scenarios even though the SSR gate already
 * covers it for the other three: duplicating a handful of cases is the price of
 * having the fourth library in the comparison.
 */
export const ANGULAR_COMPONENTS = new Set([
  "Alert",
  "Button",
  "Checkbox",
  "Icon",
  "Card",
  "Divider",
  "Field",
  "FieldError",
  "Input",
  "RadioGroup",
  "Skeleton",
  "Switch",
  "Tag",
  "TextArea",
]);

export const FRUIT = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

/**
 * A component that renders once and does nothing, compared in every library.
 *
 * These duplicate cases the SSR gate already covers for React, Svelte and Vue,
 * and exist because Angular is compared in the browser only — without them the
 * fourth library would not be compared at all. Kept to the states that actually
 * vary rather than the SSR gate's full matrix.
 */
export function staticScenarios(
  component: string,
  cases: readonly {
    name: string;
    props?: Record<string, unknown>;
    skip?: { framework: string; reason: string }[];
  }[],
): BrowserScenario[] {
  return cases.map(({ name, props, skip }) => ({
    component,
    name,
    props: props ?? {},
    steps: [],
    regions: ["#mount"],
    ...(skip ? { skip } : {}),
  }));
}

export const part = (scope: string, name: string) => `[data-scope="${scope}"][data-part="${name}"]`;

/** Shared by every scenario that renders a Select. Checked, like the SSR gate's. */
export const HIDDEN_SELECT_TEXT: ParityTextAllowance = {
  selector: "select option",
  reason:
    'Ark Vue\'s HiddenSelect renders an option\'s text as "Apple > ". The element ' +
    "is aria-hidden and visually hidden, and exists only so the value is " +
    "submitted with a form. Same allowance as the SSR gate's.",
};

/**
 * The one thing the field family cannot compare across all four libraries.
 *
 * Ark React folds a field's error text into `aria-describedby`; Ark Svelte and
 * Ark Vue name it with `aria-errormessage` and leave `aria-describedby` to the
 * helper text alone. The difference is upstream, not in any port: `@ark-ui/react`,
 * `@ark-ui/svelte` and `@ark-ui/vue` release independently, and their Field
 * machines disagree on this one attribute.
 *
 * It is not version drift, which is the first explanation to reach for and the
 * wrong one: Svelte is on Ark 5.24 and Vue on 5.39, and those two agree against
 * React's 5.37 sitting between them. A version progression cannot produce that.
 * It is Ark's React Field differing from its Svelte and Vue Fields.
 *
 * Nor is "two out of three, so React should move" a safe conclusion. ARIA 1.2
 * added `aria-errormessage`, but screen-reader support for it is still patchier
 * than for `aria-describedby`, so changing React could announce *less* to real
 * users. Whichever way it is settled, it is settled upstream or by overriding
 * Ark deliberately — not by this file.
 *
 * It is browser-only, which is why nothing has seen it before: on the server
 * none of the three has found the error element yet and all three emit the same
 * `aria-describedby`. The SSR gate therefore still compares Svelte and Vue for
 * exactly these cases — what is skipped here is a second, weaker run of them,
 * not the coverage.
 */
const ERROR_TEXT_SKEW =
  "Ark React folds the error text into aria-describedby; Ark Svelte and Ark Vue " +
  "use aria-errormessage. The Field machines have drifted apart upstream — no " +
  "port did this — and the SSR gate still compares all three for this same " +
  "case, where the difference does not arise.";

export const ARK_ERROR_TEXT_SKEW = [
  { framework: "svelte", reason: ERROR_TEXT_SKEW },
  { framework: "vue", reason: ERROR_TEXT_SKEW },
];

/** Open by clicking the trigger, and wait until the content says it is open. */
export const openViaTrigger = (scope: string): Step[] => [
  { do: "click", target: part(scope, "trigger") },
  { do: "wait", target: `${part(scope, "content")}[data-state="open"]` },
];
