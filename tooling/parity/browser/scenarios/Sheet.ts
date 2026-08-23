import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

const NOT_IN_SVELTE = [
  { framework: "svelte", reason: "Sheet is not in the Svelte package's tier-1." },
];

const scenarios: BrowserScenario[] = [
  {
    component: "Sheet",
    name: "open",
    steps: [...openViaTrigger("dialog"), { do: "wait", target: '#mount[aria-hidden="true"]' }],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
    skip: NOT_IN_SVELTE,
  },
  {
    component: "Sheet",
    // The edge and the extent are the whole of what makes this a Sheet rather
    // than a Dialog, and both are recipe variants on the portalled panel — so
    // the SSR gate, which compares the trigger only, never sees them.
    name: "open from the left",
    props: { contentProps: { side: "left", size: "lg" } },
    steps: openViaTrigger("dialog"),
    regions: [part("dialog", "positioner")],
    skip: NOT_IN_SVELTE,
  },
  {
    component: "Sheet",
    name: "dismissed with Escape",
    // Focus is waited on before the keypress, and it is not decoration. Ark
    // React (zag 1.41) and Ark Vue (zag 1.43) register the dismissable layer on
    // different ticks, so an Escape sent the instant `data-state` flips can
    // reach one library's listener and miss the other's — which reports as
    // "React stayed open" on a loaded machine and passes on an idle one. Focus
    // landing inside the content is the signal that the layer is live.
    steps: [
      ...openViaTrigger("dialog"),
      { do: "awaitFocus", target: part("dialog", "content") },
      { do: "press", key: "Escape" },
    ],
    regions: ["#mount"],
    // `.sheet__popup` sets `display: flex` for the same reason `.dialog__popup`
    // does, and with the same consequence. See the Dialog scenario.
    visibilityMatches: [part("dialog", "content")],
    skip: NOT_IN_SVELTE,
  },
];

export default scenarios;
