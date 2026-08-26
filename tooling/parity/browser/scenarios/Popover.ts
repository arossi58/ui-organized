import { openViaTrigger, part, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  // Closed is the state that matters most on a trigger: Ark's `aria-controls`
  // would name content that is not mounted, and `popupControls` drops it.
  ...staticScenarios("Popover", [{ name: "closed" }]),
  {
    component: "Popover",
    name: "open",
    steps: openViaTrigger("popover"),
    regions: [part("popover", "positioner"), "#mount"],
  },
  {
    component: "Popover",
    name: "open with side and offset",
    props: { contentProps: { side: "right", align: "start", sideOffset: 16 } },
    steps: openViaTrigger("popover"),
    // The positioning bridge carries side/align from Content up to Root, and
    // each library implements it differently — React with a layout effect,
    // Svelte with a context accessor, Vue with a watchEffect. Ark reflects the
    // resolved placement onto the content as `data-placement`, so the three
    // implementations are comparable rather than merely plausible.
    regions: [part("popover", "positioner")],
  },
  {
    component: "Popover",
    name: "dismissed with Escape",
    steps: [...openViaTrigger("popover"), { do: "press", key: "Escape" }],
    regions: ["#mount"],
    hidden: [part("popover", "content")],
  },
];

export default scenarios;
