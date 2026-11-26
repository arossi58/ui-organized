import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * At the harness's 1280px viewport, `auto` is a rail; `breakpoint: 4000` puts
 * the same viewport under it, which is the sheet layout without resizing the
 * page. Every scenario waits for `data-layout`, which `auto` writes only once
 * the page has run: before that every library renders the server's rail.
 *
 * The sheet portals out of `#mount`, so its positioner is a region of its own.
 */
const BASE = { mainId: "main", sidebar: true, header: { logo: true, nav: true, actions: true } };
const SHEET = { ...BASE, breakpoint: 4000 };

const MENU = ".app-header__menu";
const CONTENT = part("dialog", "content");
const OPEN = `${CONTENT}[data-state="open"]`;

const scenarios: BrowserScenario[] = [
  {
    component: "AppShell",
    name: "rail",
    props: BASE,
    steps: [{ do: "wait", target: '.app-shell[data-layout="rail"]' }],
    regions: ["#mount"],
  },
  {
    component: "AppShell",
    name: "sheet",
    props: SHEET,
    steps: [{ do: "wait", target: '.app-shell[data-layout="sheet"]' }],
    regions: ["#mount"],
    hidden: [CONTENT],
  },
  {
    component: "AppShell",
    name: "sheet opened",
    props: SHEET,
    steps: [
      { do: "wait", target: '.app-shell[data-layout="sheet"]' },
      { do: "click", target: MENU },
      { do: "wait", target: OPEN },
      // Ark Vue hides the page a frame after it opens; see Sheet's scenarios.
      { do: "wait", target: '#mount[aria-hidden="true"]' },
    ],
    regions: [part("dialog", "positioner"), "#mount"],
  },
  {
    // A click in the sheet that goes to a page closes it and hands focus back
    // to the menu button, as Escape does.
    component: "AppShell",
    name: "sheet closed by navigating",
    props: SHEET,
    steps: [
      { do: "wait", target: '.app-shell[data-layout="sheet"]' },
      { do: "click", target: MENU },
      { do: "wait", target: OPEN },
      // The second item: the harness's stub icon is an unsized 300 by 150
      // <svg>, and in the sheet's close button it spills over the first.
      { do: "click", target: `${CONTENT} .nav-item:nth-child(2) .nav-item__trigger` },
      { do: "awaitFocus", target: MENU },
      { do: "awaitHidden", target: CONTENT },
    ],
    regions: ["#mount"],
    visibilityMatches: [CONTENT],
  },
  {
    component: "AppShell",
    name: "sheet closed with Escape",
    props: SHEET,
    steps: [
      { do: "wait", target: '.app-shell[data-layout="sheet"]' },
      { do: "click", target: MENU },
      { do: "wait", target: OPEN },
      { do: "awaitFocus", target: CONTENT },
      { do: "press", key: "Escape" },
      { do: "awaitFocus", target: MENU },
      { do: "awaitHidden", target: CONTENT },
    ],
    regions: ["#mount"],
    visibilityMatches: [CONTENT],
  },
  ...staticScenarios("AppShell", [
    { name: "page only", props: { mainId: "main", layout: "rail" } },
    { name: "main scroll", props: { ...BASE, layout: "rail", scroll: "main" } },
  ]),
];

export default scenarios;
