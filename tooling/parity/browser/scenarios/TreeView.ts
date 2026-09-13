import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Every case names the tree.
 *
 * Ark's tree part points `aria-labelledby` at the Label part's id whether or not
 * a Label was rendered, so an unlabelled tree ships a reference to an id that
 * was never issued — in all four libraries alike. The contract normalises ids by
 * numbering the ones it finds, so a dangling reference survives as whatever
 * literal the renderer produced and reports a difference that is only ever the
 * id scheme. That is Ark's bug rather than any port's; the cases stay on the
 * labelled path, which is also the only one worth shipping.
 */
const label = "Files";

/**
 * Three levels, so the recursion has to survive more than one hop, and a leaf
 * beside a branch at the top level so `--depth` and `aria-level` are compared at
 * the same depth from two different parents.
 */
const items = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "app.ts" },
      { id: "lib", label: "lib", children: [{ id: "util", label: "util.ts" }] },
    ],
  },
  { id: "readme", label: "README.md" },
];

const branchControl = part("tree-view", "branch-control");
/**
 * Open the first branch by clicking it.
 *
 * Waits on the control alone, deliberately. The panel's own `data-state` is not
 * a reliable settle signal on this path: zag's collapsible content omits it
 * while its first-transition `skip` guard is set, and Ark React never writes
 * `"open"` there at all — waiting for it times out rather than converging. The
 * Svelte and Vue components strip the same value for the same reason, so the
 * three agree here; see the note in either component.
 */
const expandFirstBranch = () => [
  { do: "click", target: branchControl },
  { do: "wait", target: `${branchControl}[data-state="open"]` },
] as const;


const scenarios: BrowserScenario[] = [
  ...staticScenarios("TreeView", [
    // Collapsed, and the case that pins where the roving tabindex starts: one
    // node carries `data-focus` and `tabindex="0"` from first render, before
    // anything has been clicked.
    { name: "default", props: { items, label } },
    // A collapsed branch still renders its children, hidden — so expansion
    // changes attributes rather than the element list, and both are compared.
    { name: "expanded branch", props: { items, label, defaultExpandedValue: ["src"] } },
    {
      name: "expanded to the leaf",
      props: { items, label, defaultExpandedValue: ["src", "lib"] },
    },
    { name: "selected leaf", props: { items, label, defaultSelectedValue: ["readme"] } },
    // A selected *branch* marks four elements where a leaf marks two, and only
    // some of them: the text under a branch does not take `data-selected` where
    // the text under a leaf does.
    {
      name: "selected branch",
      props: { items, label, defaultExpandedValue: ["src"], defaultSelectedValue: ["src"] },
    },
    {
      name: "multiple selection",
      props: {
        items,
        label,
        selectionMode: "multiple",
        defaultExpandedValue: ["src"],
        defaultSelectedValue: ["app", "readme"],
      },
    },
    // A disabled node loses `aria-selected` entirely rather than reporting
    // `false`, and takes the roving focus off itself onto the next one.
    {
      name: "disabled node",
      props: {
        items: [
          { id: "one", label: "One", disabled: true },
          { id: "two", label: "Two" },
        ],
        label,
      },
    },
    { name: "no indent guides", props: { items, label, defaultExpandedValue: ["src"], showIndentGuides: false } },
    { name: "size/lg", props: { items, label, size: "lg" } },
    { name: "variant/bordered", props: { items, label, variant: "bordered" } },
  ]),
  {
    component: "TreeView",
    // Expansion driven rather than declared, which is the half `defaultExpanded`
    // cannot reach: the branch, its control, its indicator, its text and its
    // panel all change together, and a library that updated four of the five
    // would look right and read wrong.
    name: "branch expanded by clicking it",
    props: { items, label },
    steps: [
      ...expandFirstBranch(),
    ],
    regions: ["#mount"],
  },
  {
    component: "TreeView",
    // Roving focus. `data-focus` is the keyboard highlight in the shared
    // stylesheet and it has to follow real DOM focus, so the assertion is the
    // attribute *and* `awaitFocus` on the row that should have moved.
    name: "arrowed down to the next node",
    props: { items, label },
    steps: [
      ...expandFirstBranch(),
      { do: "awaitFocus", target: branchControl },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${part("tree-view", "item")}[data-focus]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
