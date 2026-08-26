import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

const ITEMS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right", disabled: true },
];

const SIZES = ["sm", "md", "lg"] as const;

const item = (value: string) => `${part("toggle-group", "item")}[id$=":${value}"]`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Toggle", [
    { name: "default", props: { label: "Bold" } },
    /**
     * Pressed is three attributes at once — `aria-pressed`, `data-state="on"`
     * and `data-pressed` — and only the middle one is styled. The other two are
     * still the contract, and `data-pressed` is emitted by the *standalone*
     * toggle alone: Zag's group item has no such attribute.
     */
    { name: "pressed", props: { label: "Bold", defaultPressed: true } },
    { name: "controlled pressed", props: { label: "Bold", pressed: true } },
    /** Unlike Collapsible's trigger, this one really is natively disabled. */
    { name: "disabled", props: { label: "Bold", disabled: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { label: "Bold", size } })),
    /**
     * No label at all: the icon-only square. React tests its children for
     * emptiness and Angular can only ask whether a `label` was given — this is
     * the case that pins the two to the same answer.
     */
    { name: "icon only", props: { icon: "check" } },
    { name: "icon and label", props: { icon: "check", label: "Bold" } },
    ...SIZES.map((size) => ({ name: `icon only/${size}`, props: { icon: "check", size } })),
    { name: "extra class", props: { label: "Bold", className: "custom" } },
    /**
     * A single-select group is a `radiogroup` of `radio`s reporting
     * `aria-checked`; a multi-select one is a plain `group` reporting
     * `aria-pressed`. Zag emits exactly one of the pair, and swapping them is
     * invisible until a screen reader arrives.
     */
    { name: "group", props: { items: ITEMS } },
    { name: "group/multiple", props: { items: ITEMS, multiple: true } },
    { name: "group/vertical", props: { items: ITEMS, orientation: "vertical" } },
    { name: "group/selected", props: { items: ITEMS, defaultValue: ["center"] } },
    /**
     * A group-level disable reaches every item *and* the root, which is the
     * split worth checking: Accordion's reaches the items only.
     */
    { name: "group/disabled", props: { items: ITEMS, disabled: true } },
  ]),
  {
    component: "Toggle",
    name: "group/item clicked",
    props: { items: ITEMS },
    /**
     * A click moves two things: the pressed value, and the roving `tabindex` and
     * `data-focus` that follow focus into the group. The root's own `data-focus`
     * only exists once focus is really inside it.
     */
    steps: [
      { do: "click", target: item("center") },
      { do: "wait", target: `${item("center")}[data-state="on"]` },
      { do: "awaitFocus", target: part("toggle-group", "root") },
    ],
    regions: ["#mount"],
  },
  {
    component: "Toggle",
    name: "group/arrow wraps past the disabled item",
    props: { items: ITEMS, defaultValue: ["left"] },
    /**
     * ArrowRight from the second item has to skip the disabled third and wrap to
     * the first — moving focus only, because a toggle group does not activate on
     * focus the way Tabs does. Landing on the disabled item merely looks like
     * nothing happened, which is why this is the arithmetic worth asserting.
     */
    steps: [
      { do: "click", target: item("center") },
      { do: "awaitFocus", target: part("toggle-group", "root") },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${item("left")}[data-focus]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
