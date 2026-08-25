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
    steps: [...openViaTrigger("dialog"), { do: "press", key: "Escape" }],
    regions: ["#mount"],
    /**
     * Only that the three agree — because they agree on something wrong, and it
     * is not theirs.
     *
     * `.dialog__popup` sets `display: flex`, which beats the `hidden` attribute
     * Ark writes when the dialog closes. The popup is invisible (`opacity: 0`)
     * and cannot be clicked (the positioner is `pointer-events: none`), so
     * nothing looks broken — but it is still laid out, and therefore still in
     * the accessibility tree. The dialog's role, heading, description and close
     * button are announced to a screen reader on any page that mounts a Dialog,
     * before it has ever been opened. Confirmed identical in all three
     * libraries, so it is the shared stylesheet rather than any port.
     *
     * Not asserted here as `hidden`, because the fix is a change to a published
     * package's behaviour — `[hidden] { display: none }` also removes the 150ms
     * exit fade — and that is a decision, not a port bug.
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
