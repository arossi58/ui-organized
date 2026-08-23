import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

const ITEMS = [
  { value: "one", title: "One", content: "First" },
  { value: "two", title: "Two", content: "Second" },
  { value: "three", title: "Three", content: "Third", disabled: true },
];

const trigger = (value: string) =>
  `${part("accordion", "item-trigger")}[data-controls$=":${value}"]`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Accordion", [
    /**
     * Everything closed, which is the case that pins down the panel's *other*
     * state: `data-state="closed"` plus `hidden`, plus the `data-collapsible`
     * Ark's Collapsible layer leaves on it whether it is open or not.
     */
    { name: "default", props: { items: ITEMS } },
    /**
     * An item that is already open, and the reason this one exists on its own:
     * a settled open panel reports **no** `data-state` at all — Zag's collapsible
     * drops it once the enter transition is over. Emitting a helpful
     * `data-state="open"` is the natural thing for a port to do and would be a
     * difference from all three other libraries.
     */
    { name: "open by default", props: { items: ITEMS, defaultValue: ["one"] } },
    { name: "two open", props: { items: ITEMS, defaultValue: ["one", "two"] } },
    { name: "single mode", props: { items: ITEMS, multiple: false } },
    /**
     * A group-level disable, which Zag reads as `item.disabled ?? root.disabled`
     * — so it reaches every item's parts while the *root* itself reports nothing.
     * A port that put `data-disabled` on the root as well would pass every unit
     * test and differ here.
     */
    { name: "all disabled", props: { items: ITEMS, disabled: true } },
    { name: "variant/bordered", props: { items: ITEMS, variant: "bordered" } },
    { name: "variant/separated", props: { items: ITEMS, variant: "separated" } },
    { name: "size/sm", props: { items: ITEMS, size: "sm" } },
    { name: "size/lg", props: { items: ITEMS, size: "lg" } },
    // The item id is `collapsible:accordion:<machine>:item:<value>`, so a numeric
    // value has to be stringified in the same place in every library.
    {
      name: "numeric values",
      props: { items: [{ value: 1, title: "One", content: "First" }] },
    },
  ]),
  {
    component: "Accordion",
    name: "item opened",
    props: { items: ITEMS },
    /**
     * Opening is where the panel's attributes change *and* the item gains
     * `data-focus`, since clicking the trigger focuses it.
     *
     * Waited on the trigger rather than the panel: the trigger carries
     * `data-state="open"` at every moment, while the panel's is transient by
     * design. The second wait is for the panel actually being shown, which is
     * the last thing to settle.
     */
    steps: [
      { do: "click", target: trigger("one") },
      { do: "wait", target: `${trigger("one")}[data-state="open"]` },
      { do: "wait", target: `${part("accordion", "item-content")}:not([hidden])` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Accordion",
    name: "single mode closes the other item",
    props: { items: ITEMS, multiple: false, defaultValue: ["one"] },
    /**
     * The one behaviour `multiple` actually names, and the one a port gets wrong
     * by treating the value as a set it only ever adds to.
     */
    steps: [
      { do: "click", target: trigger("two") },
      { do: "wait", target: `${trigger("two")}[data-state="open"]` },
      { do: "wait", target: `${trigger("one")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
