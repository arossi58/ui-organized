import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

/**
 * AlertDialog is in React's tier-1 and Vue's, and not yet in Svelte's — so
 * React is the only side to compare against, and the skip entry says so rather
 * than the scenario quietly not existing.
 */
const NOT_IN_SVELTE = [
  { framework: "svelte", reason: "AlertDialog is not in the Svelte package's tier-1." },
];

const scenarios: BrowserScenario[] = [
  {
    component: "AlertDialog",
    name: "open",
    // Waiting on `aria-hidden` is not weakening the assertion — `#mount` is one
    // of the compared regions, so a library that never applied it would still
    // fail, just here instead of in a diff that comes and goes. Same reasoning
    // as the Dialog scenario, which found the race first.
    steps: [...openViaTrigger("dialog"), { do: "wait", target: '#mount[aria-hidden="true"]' }],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
    skip: NOT_IN_SVELTE,
  },
  {
    component: "AlertDialog",
    // The parts the SSR gate cannot reach at all: the size recipe, the optional
    // close button and the destructive Confirm all live inside the portal.
    name: "open with a destructive confirm",
    props: { contentProps: { size: "md", showClose: true }, confirmProps: { intent: "destructive" } },
    steps: openViaTrigger("dialog"),
    regions: [part("dialog", "positioner")],
    skip: NOT_IN_SVELTE,
  },
  {
    component: "AlertDialog",
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
    /**
     * Only that the two agree — because where they disagree with `hidden`, they
     * do it identically and it is not theirs. `.dialog__popup` sets
     * `display: flex`, which beats the `hidden` attribute Ark writes on close;
     * the popup is invisible and unclickable but still laid out. See the Dialog
     * scenario, where this is written up in full: it is the shared stylesheet
     * rather than any port, and AlertDialog reuses that stylesheet.
     */
    visibilityMatches: [part("dialog", "content")],
    skip: NOT_IN_SVELTE,
  },
];

export default scenarios;
