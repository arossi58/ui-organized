import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A sub-page button placed on its own, rather than inside a `NavItem`'s list.
 *
 * `Navigation` already compares the list form, and deliberately cannot reach
 * this one: an item suppresses its whole sub-list on a collapsed rail, so
 * `nav-sub-item--collapsed` and the `title` that stands in for the hidden label
 * are unreachable there in all four libraries.
 *
 * Every case here is one the SSR gate already runs for the other three — the
 * duplication is what buys Angular a comparison at all, since it is compared in
 * the browser only.
 */
const scenarios: BrowserScenario[] = staticScenarios("NavSubItem", [
  { name: "default" },
  { name: "selected", props: { selected: true } },
  { name: "disabled", props: { disabled: true } },
  { name: "with icon", props: { icon: "check" } },
  { name: "collapsed by the rail", props: { rail: true } },
  { name: "collapsed by itself", props: { collapsed: true } },
  // The case `||` would get wrong: an explicit `false` has to beat the rail.
  { name: "expanded against the rail", props: { rail: true, collapsed: false } },
  { name: "collapsed and selected", props: { rail: true, selected: true, icon: "check" } },
]);

export default scenarios;
