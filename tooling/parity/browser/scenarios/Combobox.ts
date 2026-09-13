import { ARK_ERROR_TEXT_SKEW, FRUIT, part, type BrowserScenario } from "./scenario.js";

/**
 * The field chrome, and then the popup.
 *
 * Every case below the interactive one is a different set of ARIA across three
 * elements at once — the label's `for`, the input's `aria-controls` and
 * `aria-describedby`, the trigger's conditional `aria-controls` — which is where
 * a port drops a reference and the field quietly loses its accessible name. The
 * SSR gate covers them for the other three; Angular is compared in the browser
 * only, so they are repeated here.
 *
 * `exclude` drops the positioner from the static cases, exactly as the SSR
 * spec's does. The four libraries do not agree on *where* a closed popup lives —
 * React portals it, Vue teleports, Ark Svelte renders nothing — and the harness
 * numbers every id in the document in order, so a subtree that exists in one
 * capture and not another renumbers everything after it. Dropping it before the
 * numbering compares the field on its own terms; the open case below compares
 * the popup properly, once there is one.
 */
const chrome = (
  name: string,
  props: Record<string, unknown>,
  skip?: { framework: string; reason: string }[],
): BrowserScenario => ({
  component: "Combobox",
  name,
  props,
  steps: [],
  regions: ["#mount"],
  exclude: part("combobox", "positioner"),
  ...(skip ? { skip } : {}),
});

const scenarios: BrowserScenario[] = [
  chrome("default", { options: FRUIT }),
  chrome("with label", { options: FRUIT, label: "Fruit" }),
  chrome("placeholder", { options: FRUIT, placeholder: "Search" }),
  chrome("required", { options: FRUIT, label: "Fruit", required: true }),
  chrome("helper text", { options: FRUIT, label: "Fruit", helperText: "Type to filter" }),
  // Compared against React alone: Ark's three Field machines disagree about
  // which attribute names the error text. See ARK_ERROR_TEXT_SKEW.
  chrome("error", { options: FRUIT, label: "Fruit", error: "Required" }, ARK_ERROR_TEXT_SKEW),
  chrome("selected", { options: FRUIT, defaultValue: "b", label: "Fruit" }),
  chrome("disabled", { options: FRUIT, label: "Fruit", disabled: true }),
  ...(["sm", "md", "lg"] as const).map((size) =>
    chrome(`size/${size}`, { options: FRUIT, size, label: "F" }),
  ),
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
];

export default scenarios;
