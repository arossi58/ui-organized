import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The tab panel's `data-state`, which one of the four does not emit yet.
 *
 * The same allowance the SSR case carries, restated here rather than shared,
 * because the two gates check it against the stylesheet independently and a
 * shared constant would let one of them go stale without saying so. Ark React
 * and Ark Vue add `data-state=open|closed` to the panel through their presence
 * layer; the Svelte package is on an older wrapper and has not. `Tabs.css`
 * styles the panel on `[hidden]` and `[data-selected]`, both of which all four
 * emit, so nothing renders differently — and the assertion below fails the
 * moment `Tabs.css` starts selecting on `data-state`.
 */
const PANEL_STATE_SKEW = {
  attribute: "data-state",
  reason:
    "@ark-ui/svelte is on an older wrapper than @ark-ui/react, and the tab " +
    "panel gained data-state=open|closed in between. Tabs.css styles the " +
    "panel on [hidden] and [data-selected], both of which Svelte does emit.",
};

const TABS = [
  { value: "one", label: "One", content: "First" },
  { value: "two", label: "Two", content: "Second" },
  { value: "three", label: "Three", content: "Third", disabled: true },
];

const trigger = (value: string) => `${part("tabs", "trigger")}[data-value="${value}"]`;

/**
 * The panel belonging to a tab, found through the trigger it names.
 *
 * A panel carries no `data-value` of its own, and its id is a different literal
 * in every library — but `aria-labelledby` always ends in the trigger's value,
 * which is exactly the reference the SSR gate normalises. So this selects the
 * same element on all four sides without knowing any of their id schemes.
 */
const panelOf = (value: string) =>
  `${part("tabs", "content")}[aria-labelledby$="trigger-${value}"]`;

const withSkew = (scenarios: BrowserScenario[]): BrowserScenario[] =>
  scenarios.map((scenario) => ({
    ...scenario,
    allow: [PANEL_STATE_SKEW],
    stylesheets: ["Tabs/Tabs.css"],
  }));

const scenarios: BrowserScenario[] = [
  ...withSkew(
    staticScenarios("Tabs", [
      /**
       * The state a tab strip is in before anyone touches it, and the one most
       * likely to be got wrong: the *selected* trigger already carries
       * `data-focus` — Zag seeds its focused value from the selection — while
       * the root and the list carry none, because focus is not actually in
       * there. A port that treated `data-focus` as "has DOM focus" reports
       * nothing here and looks correct until a keyboard arrives.
       */
      { name: "default", props: { tabs: TABS } },
      { name: "second selected", props: { tabs: TABS, defaultValue: "two" } },
      { name: "vertical", props: { tabs: TABS, orientation: "vertical" } },
      { name: "small", props: { tabs: TABS, size: "small" } },
      // Numeric values are coerced at the Zag boundary in every library, and the
      // ids built out of them have to come out the same on all four.
      {
        name: "numeric values",
        props: {
          tabs: [
            { value: 1, label: "One", content: "First" },
            { value: 2, label: "Two", content: "Second" },
          ],
        },
      },
    ]),
  ),
  {
    component: "Tabs",
    name: "second tab clicked",
    props: { tabs: TABS },
    /**
     * A click moves three things at once: the selection, the focused tab, and
     * the `data-focus` on the root and list that only exists once focus is
     * really inside the strip. Waiting on `[data-selected]` rather than on the
     * panel's `data-state` because that is the attribute all four agree on —
     * see `PANEL_STATE_SKEW`.
     */
    steps: [
      { do: "click", target: trigger("two") },
      { do: "wait", target: `${trigger("two")}[data-selected]` },
      // The trigger flips first. Ark Vue re-hides the panel that *lost* the
      // selection a tick later, so a capture taken on the trigger alone catches
      // it with two visible panels — a difference that is about to disappear
      // rather than one that is real.
      { do: "wait", target: `${panelOf("one")}[hidden]` },
    ],
    regions: ["#mount"],
    allow: [PANEL_STATE_SKEW],
    stylesheets: ["Tabs/Tabs.css"],
  },
  {
    component: "Tabs",
    name: "arrow wraps past the disabled tab",
    props: { tabs: TABS, defaultValue: "two" },
    /**
     * Zag's tabs activate on focus, so ArrowRight from the second tab has to
     * skip the disabled third and wrap to the first — selecting it on the way.
     * Three separate rules in one keypress, and each of them is silent when it
     * is wrong: landing on the disabled tab merely looks like nothing happened.
     *
     * The focus wait is the precondition the keypress needs. Clicking focuses
     * the trigger in every browser, but the libraries commit that state at
     * different moments; a keypress sent before it lands goes to `document.body`.
     */
    steps: [
      { do: "click", target: trigger("two") },
      { do: "awaitFocus", target: part("tabs", "list") },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${trigger("one")}[data-selected]` },
      // See "second tab clicked": the losing panel is the last thing to settle.
      { do: "wait", target: `${panelOf("two")}[hidden]` },
    ],
    regions: ["#mount"],
    allow: [PANEL_STATE_SKEW],
    stylesheets: ["Tabs/Tabs.css"],
  },
];

export default scenarios;
