import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A whole sidebar rather than an item on its own, because the thing most likely
 * to drift is what the container tells its descendants: the collapsed rail
 * travels on context, and an item that ignored it would render a full-width
 * label inside a 56px column with nothing else visibly wrong.
 *
 * The tree is fixed and the cases vary the container, so every case exercises
 * both a plain item and an expandable one with sub-items.
 */
const TOGGLE = ".sidebar__toggle";
const EXPANDABLE = ".nav-item__trigger--expandable";

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Navigation", [
    { name: "default" },
    { name: "with logo", props: { logo: "Acme" } },
    { name: "with footer", props: { footer: "v1.2.0" } },
    // `collapsible` conjures a footer of its own, so the region appears with no
    // footer content at all.
    { name: "collapsible", props: { collapsible: true } },
    { name: "collapsible with footer", props: { collapsible: true, footer: "v1.2.0" } },
    // The initial state each library holds in its own local state.
    { name: "default collapsed", props: { collapsible: true, defaultCollapsed: true } },
    { name: "controlled collapsed", props: { collapsible: true, collapsed: true, logo: "Acme" } },
    { name: "controlled expanded", props: { collapsible: true, collapsed: false } },
    // A collapsed rail has no room for an inline sub-list, so the expandable
    // item loses its caret, its aria-expanded/aria-controls and its panel.
    {
      name: "collapsed suppresses the sub-list",
      props: { defaultCollapsed: true, itemProps: { defaultExpanded: true } },
    },
    { name: "expanded item", props: { itemProps: { defaultExpanded: true } } },
    { name: "disabled item", props: { itemProps: { disabled: true } } },
    { name: "nav label", props: { navLabel: "Sections" } },
  ]),
  {
    component: "Navigation",
    name: "toggle collapses the rail",
    props: { collapsible: true, logo: "Acme" },
    /**
     * The one thing a static render cannot reach: the toggle is uncontrolled in
     * every library here, so this is where a port that wired its own state
     * backwards shows up. It moves five things at once — the root class, both
     * items' rails, the toggle's `aria-expanded`, and the sub-list, which
     * disappears entirely.
     */
    steps: [
      { do: "click", target: TOGGLE },
      { do: "wait", target: `${TOGGLE}[aria-expanded="false"]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Navigation",
    name: "expandable item opens",
    /**
     * The disclosure, driven rather than seeded. `aria-expanded` flips, the
     * caret swaps icon, and the panel appears — and the panel is named by an id
     * the trigger has to point at, so a port that generated the id in the wrong
     * place fails here rather than merely looking odd.
     */
    steps: [
      { do: "click", target: EXPANDABLE },
      { do: "wait", target: `${EXPANDABLE}[aria-expanded="true"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
