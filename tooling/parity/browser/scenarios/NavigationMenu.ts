import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Two links in the first panel and a link in the bar, the same tree as the
 * SSR cases. Every panel is rendered inline under its item, so `#mount` holds
 * the whole menu, open or closed.
 *
 * No scenario follows a link: the hrefs are real paths, and a click would
 * navigate the harness page away. Hover runs with `openDelay: 0`, as HoverCard's
 * does, so nothing waits on the clock.
 *
 * And no link has an icon, unlike the SSR cases. The harness's stub icon is an
 * unsized `<svg>`, 300 by 150, centred in the 20px icon box, so in an open panel
 * it reaches 65px up over the trigger and takes the pointer from the next
 * hover or click on it. A real icon is sized; the stub only stands in for one.
 */
const ITEMS = [
  {
    value: "product",
    label: "Product",
    links: [
      { href: "/reports", title: "Reports", description: "Charts of every metric." },
      { href: "/alerts", title: "Alerts", description: "Hear about changes as they happen." },
    ],
  },
  { value: "pricing", label: "Pricing", href: "/pricing" },
];

const TRIGGER = part("navigation-menu", "trigger");
const CONTENT = part("navigation-menu", "content");
const LINK = part("navigation-menu", "link");
const OPEN = `${CONTENT}[data-state="open"]`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("NavigationMenu", [
    { name: "closed", props: { "aria-label": "Main", items: ITEMS } },
    {
      name: "disabled trigger",
      props: { items: [{ ...ITEMS[0], disabled: true }, ITEMS[1]] },
    },
    { name: "open by default", props: { defaultValue: "product", items: ITEMS } },
  ]),
  {
    component: "NavigationMenu",
    name: "opened by a click",
    props: { items: ITEMS },
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: OPEN },
    ],
    regions: ["#mount"],
  },
  {
    component: "NavigationMenu",
    name: "closed by a second click",
    props: { items: ITEMS },
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: OPEN },
      { do: "click", target: TRIGGER },
      { do: "awaitHidden", target: CONTENT },
    ],
    regions: ["#mount"],
    hidden: [CONTENT],
  },
  {
    component: "NavigationMenu",
    name: "opened on hover",
    props: { openDelay: 0, items: ITEMS },
    steps: [
      { do: "hover", target: TRIGGER },
      { do: "wait", target: OPEN },
    ],
    regions: ["#mount"],
  },
  {
    // ArrowDown on a trigger moves into the open panel, and on a link to the
    // next one. Focus itself is not in the contract, so the step that would
    // fail is the `awaitFocus`, which waits on the second link in every library.
    component: "NavigationMenu",
    name: "arrow keys into the panel",
    props: { items: ITEMS },
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: OPEN },
      { do: "press", key: "ArrowDown" },
      { do: "awaitFocus", target: `${CONTENT} ${LINK}[href="/reports"]` },
      { do: "press", key: "ArrowDown" },
      { do: "awaitFocus", target: `${CONTENT} ${LINK}[href="/alerts"]` },
    ],
    regions: ["#mount"],
  },
  {
    // Escape from inside the panel gives focus back to its trigger and takes
    // the panel's links out of the tab order on the way, which zag records as
    // `data-tabindex` on each. That attribute is in the contract, so the port
    // has to leave exactly what zag leaves.
    component: "NavigationMenu",
    name: "Escape from the panel",
    props: { items: ITEMS },
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: OPEN },
      { do: "press", key: "ArrowDown" },
      { do: "awaitFocus", target: `${CONTENT} ${LINK}[href="/reports"]` },
      { do: "press", key: "Escape" },
      { do: "awaitHidden", target: CONTENT },
      { do: "awaitFocus", target: TRIGGER },
    ],
    regions: ["#mount"],
    hidden: [CONTENT],
  },
];

export default scenarios;
