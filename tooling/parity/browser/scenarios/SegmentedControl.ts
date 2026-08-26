import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

const ITEMS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
];

const SIZES = ["sm", "md", "lg"] as const;

const item = (value: string) => `${part("segment-group", "item")}[id$=":radio:${value}"]`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("SegmentedControl", [
    /**
     * The control renders no Label part, so Ark's `aria-labelledby` would name
     * an element that never exists — the dangling-IDREF case `OMIT_ARIA` is
     * there for. This is also the case that pins the ids down: they say
     * `radio-group`, not `segment-group`, because the machine underneath is the
     * radio group's.
     */
    { name: "default", props: { items: ITEMS } },
    { name: "aria-label", props: { items: ITEMS, "aria-label": "Range" } },
    { name: "selected", props: { items: ITEMS, defaultValue: "week" } },
    { name: "controlled", props: { items: ITEMS, value: "week" } },
    /** A whole-control disable reaches the root, the indicator and every part of every segment. */
    { name: "disabled", props: { items: ITEMS, disabled: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { items: ITEMS, size } })),
    /**
     * Named or not, every radio in the group shares one `name` — that is what
     * makes the browser treat them as a single choice, and it is where this
     * control's roving focus comes from. Unnamed, the machine id stands in.
     */
    { name: "named", props: { items: ITEMS, name: "range" } },
    {
      name: "with icons",
      props: {
        items: [
          { value: "yes", label: "Yes", icon: "check" },
          { value: "no", label: "No", icon: "close" },
        ],
      },
    },
    { name: "single item", props: { items: [{ value: "only", label: "Only" }] } },
  ]),
  {
    component: "SegmentedControl",
    name: "segment clicked",
    props: { items: ITEMS },
    /**
     * Clicking a `<label>` checks the radio inside it and focuses it, so this
     * moves the selection, the indicator, and `data-focus` on the segment at
     * once. The indicator is the half no static render settles: it is `hidden`
     * until it has been measured, and it has to be measured again wherever the
     * selection lands.
     */
    steps: [
      { do: "click", target: item("week") },
      { do: "wait", target: `${item("week")}[data-state="checked"]` },
      { do: "awaitFocus", target: part("segment-group", "item") },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
