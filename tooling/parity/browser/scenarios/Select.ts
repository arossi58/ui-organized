import {
  ARK_ERROR_TEXT_SKEW,
  FRUIT,
  HIDDEN_SELECT_TEXT,
  openViaTrigger,
  part,
  type BrowserScenario,
} from "./scenario.js";

/**
 * A rendered-once Select, compared in every library.
 *
 * `staticScenarios` would do, except that every Select renders the hidden
 * native control whose option text Ark Vue stringifies differently — so each of
 * these needs the same text allowance the interactive cases carry.
 */
function fieldChrome(
  cases: readonly {
    name: string;
    props: Record<string, unknown>;
    skip?: { framework: string; reason: string }[];
  }[],
): BrowserScenario[] {
  return cases.map(({ name, props, skip }) => ({
    component: "Select",
    name,
    props,
    steps: [],
    regions: ["#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
    ...(skip ? { skip } : {}),
  }));
}

const scenarios: BrowserScenario[] = [
  /**
   * The field chrome, which the SSR gate covers for the other three and cannot
   * cover for Angular at all.
   *
   * Every one of these is a different set of ARIA on three elements at once —
   * the trigger, the listbox and the hidden native control all point at the
   * Label part — so they are the cases where a port drops a reference and the
   * field silently loses its accessible name.
   */
  ...fieldChrome([
    { name: "with label", props: { options: FRUIT, label: "Fruit" } },
    // No Label part exists, so Ark's aria-labelledby on all three would dangle.
    { name: "no label", props: { options: FRUIT, placeholder: "Pick one" } },
    { name: "required", props: { options: FRUIT, label: "Fruit", required: true, name: "fruit" } },
    { name: "disabled", props: { options: FRUIT, label: "Fruit", disabled: true } },
    { name: "selected", props: { options: FRUIT, label: "Fruit", defaultValue: "b" } },
    // Ghost hides the label rather than dropping it, for the reason above.
    { name: "ghost", props: { options: FRUIT, label: "Fruit", variant: "ghost" } },
    {
      name: "error",
      props: { options: FRUIT, label: "Fruit", error: "Required" },
      // Compared against React alone: Ark's three Field machines disagree about
      // which attribute names the error text. See ARK_ERROR_TEXT_SKEW.
      skip: ARK_ERROR_TEXT_SKEW,
    },
  ]),
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
    // See the Menu scenario for why focus and the result are both waited on.
    steps: [
      ...openViaTrigger("select"),
      { do: "awaitFocus", target: part("select", "content") },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("select", "item")}[data-highlighted]` },
    ],
    regions: [part("select", "positioner")],
  },
  {
    component: "Select",
    name: "option chosen",
    props: { options: FRUIT, label: "Fruit" },
    /**
     * The half of a select nothing else here reaches: choosing closes the
     * popup, writes the value into the hidden native control that a form would
     * submit, and puts the option's label in the trigger. All three are in
     * `#mount`, and all three are wrong in a port that only tracks its own
     * state.
     */
    steps: [
      ...openViaTrigger("select"),
      { do: "click", target: `${part("select", "item")}[data-value="b"]` },
      { do: "wait", target: `${part("select", "trigger")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
];

export default scenarios;
