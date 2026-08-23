import type { ParityAllowance, ParityTextAllowance } from "../src/cases.js";

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
  "Button",
  "Card",
  "Divider",
  "Skeleton",
  "Tag",
]);

const FRUIT = [
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
function staticScenarios(
  component: string,
  cases: readonly { name: string; props?: Record<string, unknown> }[],
): BrowserScenario[] {
  return cases.map(({ name, props }) => ({
    component,
    name,
    props: props ?? {},
    steps: [],
    regions: ["#mount"],
  }));
}

const part = (scope: string, name: string) => `[data-scope="${scope}"][data-part="${name}"]`;

/** Shared by every scenario that renders a Select. Checked, like the SSR gate's. */
const HIDDEN_SELECT_TEXT: ParityTextAllowance = {
  selector: "select option",
  reason:
    'Ark Vue\'s HiddenSelect renders an option\'s text as "Apple > ". The element ' +
    "is aria-hidden and visually hidden, and exists only so the value is " +
    "submitted with a form. Same allowance as the SSR gate's.",
};

/** Open by clicking the trigger, and wait until the content says it is open. */
const openViaTrigger = (scope: string): Step[] => [
  { do: "click", target: part(scope, "trigger") },
  { do: "wait", target: `${part(scope, "content")}[data-state="open"]` },
];

export const SCENARIOS: BrowserScenario[] = [
  ...staticScenarios("Button", [
    { name: "default" },
    { name: "secondary/lg", props: { intent: "secondary", size: "lg" } },
    { name: "destructive/sm", props: { intent: "destructive", size: "sm" } },
    { name: "ghost", props: { intent: "ghost" } },
    { name: "disabled", props: { disabled: true } },
    { name: "submit", props: { type: "submit" } },
    { name: "custom class", props: { className: "mine" } },
    { name: "aria-label", props: { "aria-label": "Save" } },
  ]),
  ...staticScenarios("Card", [
    { name: "default" },
    { name: "elevated", props: { variant: "elevated" } },
    { name: "padding/none", props: { padding: "none" } },
    { name: "padding/lg", props: { padding: "lg" } },
  ]),
  ...staticScenarios("Divider", [
    { name: "default" },
    { name: "vertical", props: { orientation: "vertical" } },
    { name: "spacing/lg", props: { spacing: "lg" } },
  ]),
  ...staticScenarios("Tag", [
    { name: "default" },
    { name: "variant/error", props: { variant: "error" } },
    { name: "variant/info-secondary", props: { variant: "info-secondary" } },
    { name: "size/sm", props: { size: "sm" } },
    { name: "subdued", props: { emphasized: false } },
  ]),
  ...staticScenarios("Skeleton", [
    { name: "default" },
    { name: "variant/circle", props: { variant: "circle" } },
    { name: "variant/rounded", props: { variant: "rounded" } },
    { name: "not animated", props: { animated: false } },
    { name: "sized", props: { width: 120, height: 16 } },
    // The shape only Angular renders through a second directive; see its fixture.
    { name: "multi-line", props: { lines: 3 } },
  ]),
  {
    component: "Popover",
    name: "open",
    steps: openViaTrigger("popover"),
    regions: [part("popover", "positioner"), "#mount"],
  },
  {
    component: "Popover",
    name: "open with side and offset",
    props: { contentProps: { side: "right", align: "start", sideOffset: 16 } },
    steps: openViaTrigger("popover"),
    // The positioning bridge carries side/align from Content up to Root, and
    // each library implements it differently — React with a layout effect,
    // Svelte with a context accessor, Vue with a watchEffect. Ark reflects the
    // resolved placement onto the content as `data-placement`, so the three
    // implementations are comparable rather than merely plausible.
    regions: [part("popover", "positioner")],
  },
  {
    component: "Popover",
    name: "dismissed with Escape",
    steps: [...openViaTrigger("popover"), { do: "press", key: "Escape" }],
    regions: ["#mount"],
    hidden: [part("popover", "content")],
  },
  {
    component: "Dialog",
    name: "open",
    // A modal dialog also hides the rest of the page from assistive technology,
    // and the three libraries do not apply that in the same tick. Waiting for it
    // is not weakening the assertion — `#mount` is one of the compared regions,
    // so a library that never applied it would still fail, just here instead of
    // in a diff that comes and goes.
    steps: [
      ...openViaTrigger("dialog"),
      { do: "wait", target: '#mount[aria-hidden="true"]' },
    ],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
  },
  {
    component: "Dialog",
    name: "dismissed with Escape",
    steps: [...openViaTrigger("dialog"), { do: "press", key: "Escape" }],
    regions: ["#mount"],
    /**
     * Only that the three agree — because they agree on something wrong, and it
     * is not theirs.
     *
     * `.dialog__popup` sets `display: flex`, which beats the `hidden` attribute
     * Ark writes when the dialog closes. The popup is invisible (`opacity: 0`)
     * and cannot be clicked (the positioner is `pointer-events: none`), so
     * nothing looks broken — but it is still laid out, and therefore still in
     * the accessibility tree. The dialog's role, heading, description and close
     * button are announced to a screen reader on any page that mounts a Dialog,
     * before it has ever been opened. Confirmed identical in all three
     * libraries, so it is the shared stylesheet rather than any port.
     *
     * Not asserted here as `hidden`, because the fix is a change to a published
     * package's behaviour — `[hidden] { display: none }` also removes the 150ms
     * exit fade — and that is a decision, not a port bug.
     */
    visibilityMatches: [part("dialog", "content")],
  },
  {
    component: "Menu",
    name: "open",
    steps: openViaTrigger("menu"),
    regions: [part("menu", "positioner"), "#mount"],
  },
  {
    component: "Menu",
    name: "keyboard highlight",
    // `[data-highlighted]` drives the item's entire hover treatment and is
    // unreachable without a keypress.
    //
    // Neither the focus wait nor the result wait is decoration. The first is the
    // precondition the keypress needs — see `awaitFocus`. The second closes the
    // case where every library is simply slower than the capture: without it all
    // three highlighted nothing and the case passed by comparing two absences.
    steps: [
      ...openViaTrigger("menu"),
      { do: "awaitFocus", target: part("menu", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("menu", "item")}[data-highlighted]` },
    ],
    regions: [part("menu", "positioner")],
  },
  {
    component: "Tooltip",
    name: "shown on hover",
    props: { content: "Copy" },
    steps: [
      { do: "hover", target: part("tooltip", "trigger") },
      { do: "wait", target: `${part("tooltip", "content")}[data-state="open"]` },
    ],
    regions: [part("tooltip", "positioner"), "#mount"],
  },
  {
    component: "Select",
    name: "open",
    props: { options: FRUIT, label: "Fruit" },
    steps: openViaTrigger("select"),
    regions: [part("select", "positioner"), "#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "Select",
    name: "keyboard highlight",
    props: { options: FRUIT, label: "Fruit" },
    // See the Menu scenario above for why focus and the result are both waited on.
    steps: [
      ...openViaTrigger("select"),
      { do: "awaitFocus", target: part("select", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("select", "item")}[data-highlighted]` },
    ],
    regions: [part("select", "positioner")],
  },
  {
    component: "Combobox",
    name: "open",
    props: { options: FRUIT, label: "Fruit" },
    steps: [
      { do: "click", target: part("combobox", "trigger") },
      { do: "wait", target: `${part("combobox", "content")}[data-state="open"]` },
    ],
    regions: [part("combobox", "positioner"), "#mount"],
  },
  {
    component: "Toast",
    name: "created",
    props: {
      toasts: [
        { title: "Saved", description: "Your changes are live.", type: "success" },
        { title: "Careful", description: "Check the input.", type: "warning" },
      ],
    },
    steps: [
      { do: "click", target: "#fire" },
      { do: "wait", target: `${part("toast", "root")}[data-state="open"]` },
    ],
    regions: [part("toast", "group")],
  },
  {
    component: "SelectInDialog",
    name: "both open",
    props: { options: FRUIT },
    steps: [
      ...openViaTrigger("dialog"),
      { do: "click", target: part("select", "trigger") },
      { do: "wait", target: `${part("select", "content")}[data-state="open"]` },
    ],
    regions: [part("select", "positioner"), part("dialog", "positioner")],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
];
