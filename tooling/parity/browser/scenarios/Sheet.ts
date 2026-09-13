import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "Sheet",
    name: "open",
    steps: [...openViaTrigger("dialog"), { do: "wait", target: '#mount[aria-hidden="true"]' }],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
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
  },
  {
    component: "Sheet",
    // Non-modal, which is the one prop that changes what a sheet *does* rather
    // than where it sits: no `aria-modal` on the panel and no `aria-hidden`
    // marks on the page behind it. The absence is the assertion, so `#mount` is
    // compared rather than waited on.
    name: "open and non-modal",
    props: { modal: false },
    steps: openViaTrigger("dialog"),
    regions: [part("dialog", "positioner"), "#mount"],
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
      // And focus is waited on *after* it too, which is new. Now that
      // `[hidden]` really hides, dismissal changes what is painted — so a
      // capture taken the instant Escape is pressed can sample one library
      // mid-close and another already settled. Focus returning to the trigger
      // is the signal that the dismissal finished; before the stylesheet
      // honored `hidden`, nothing about the popup changed on close and the
      // timing could not matter.
      { do: "awaitFocus", target: part("dialog", "trigger") },
    ],
    regions: ["#mount"],
    // `.sheet__popup` sets `display: flex` for the same reason `.dialog__popup`
    // does, and with the same consequence. See the Dialog scenario.
    visibilityMatches: [part("dialog", "content")],
  },
];

export default scenarios;
