import { openViaTrigger, part, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Dialog", [{ name: "closed" }]),
  {
    component: "Dialog",
    name: "open",
    // A modal dialog also hides the rest of the page from assistive technology,
    // and the three libraries do not apply that in the same tick. Waiting for it
    // is not weakening the assertion — `#mount` is one of the compared regions,
    // so a library that never applied it would still fail, just here instead of
    // in a diff that comes and goes.
    steps: [
      ...openViaTrigger("dialog"),
      { do: "wait", target: '#mount[aria-hidden="true"]' },
    ],
    regions: [part("dialog", "backdrop"), part("dialog", "positioner"), "#mount"],
  },
  {
    component: "Dialog",
    /**
     * The non-modal case, which nothing covered until AlertDialog and Sheet were
     * built and their author noticed `UioDialog` dropped `aria-modal` entirely
     * when `modal` was false. zag takes the attribute straight from the prop, so
     * every other library reports `aria-modal="false"` here; Angular reported
     * nothing, and no scenario opened a non-modal dialog to say so.
     *
     * `#mount` is compared too, because the other half of non-modal is that the
     * page is NOT hidden from assistive technology.
     */
    name: "open and non-modal",
    props: { modal: false },
    steps: openViaTrigger("dialog"),
    regions: [part("dialog", "positioner"), "#mount"],
  },
  {
    component: "Dialog",
    name: "dismissed with Escape",
    steps: [
      ...openViaTrigger("dialog"),
      { do: "press", key: "Escape" },
      // Focus is waited on after the keypress, and it is not decoration. Now that
      // `[hidden]` really hides, dismissal changes what is painted — so a
      // capture taken the instant Escape is pressed can sample one library
      // mid-close and another already settled. Focus returning to the trigger
      // is the signal that the dismissal finished; before the stylesheet
      // honored `hidden`, nothing about the popup changed on close and the
      // timing could not matter.
      { do: "awaitFocus", target: part("dialog", "trigger") },
    ],
    regions: ["#mount"],
    /**
     * That all four agree, and that what they agree on is now correct.
     *
     * This used to record a defect instead. `.dialog__popup` set
     * `display: flex`, which beat the `hidden` attribute Ark writes on close, so
     * a dismissed dialog stayed laid out — invisible (`opacity: 0`) and
     * unclickable (`pointer-events: none` on the positioner), but still in the
     * accessibility tree. Its role, heading, description and close button were
     * announced on any page that merely mounted a Dialog. Identical in all four
     * libraries, because it was the shared stylesheet rather than any port.
     *
     * `.dialog__popup[hidden]` now honors it, and the assertion below is what
     * holds that in place: if the guard is removed, the popup is painted again
     * and this case says so.
     *
     * The cost, which the note here previously predicted: `display: none` also
     * cancels the 150ms exit fade. That was judged the better trade — a
     * component announcing itself to a screen reader before it has ever been
     * opened outranks an exit animation — but it is a real behaviour change, and
     * restoring the fade means delaying the hide (`visibility: hidden` with a
     * transition) rather than reverting the guard.
     */
    visibilityMatches: [part("dialog", "content")],
  },
  {
    component: "Dialog",
    name: "dismissed with its close button",
    /**
     * The other way out, and the one that goes through the dialog's own DOM
     * rather than through a key handler. It also exercises the page coming back:
     * `#mount` is compared, and the aria-hidden marks a modal leaves on it have
     * to be gone.
     */
    steps: [
      ...openViaTrigger("dialog"),
      { do: "click", target: part("dialog", "close-trigger") },
      { do: "wait", target: `${part("dialog", "content")}[data-state="closed"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
