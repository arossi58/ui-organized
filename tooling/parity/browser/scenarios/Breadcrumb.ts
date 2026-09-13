import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A breadcrumb renders once and does nothing, so these duplicate the SSR gate's
 * cases for the sake of the fourth library — Angular is compared in the browser
 * only. What each one pins is a branch in the same conditional: whether a crumb
 * is a link, whether it is the current page, and whether it gets a separator.
 */
const TRAIL = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Data" },
];

const scenarios: BrowserScenario[] = staticScenarios("Breadcrumb", [
  { name: "default", props: { items: TRAIL } },
  // The last crumb is the current page even when it has an href, so it must
  // still render as text — the one branch where the two conditions disagree.
  {
    name: "last crumb keeps its href but stays text",
    props: { items: [...TRAIL.slice(0, 2), { label: "Data", href: "/data" }] },
  },
  // A crumb with no href in the middle of the trail: not a link, and not the
  // current page either, so it carries no aria-current.
  {
    name: "unlinked middle crumb",
    props: { items: [TRAIL[0], { label: "Library" }, TRAIL[2]] },
  },
  // One crumb is the whole trail, so it is the current page and there is no
  // separator anywhere — the case an off-by-one in `isLast` renders wrongly.
  { name: "single crumb", props: { items: [{ label: "Home" }] } },
  {
    name: "with icons",
    props: {
      items: [
        { label: "Home", href: "/", icon: "check" },
        { label: "Data", icon: "close" },
      ],
    },
  },
  { name: "custom separator", props: { items: TRAIL, separator: "/" } },
]);

export default scenarios;
