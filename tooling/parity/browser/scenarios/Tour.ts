import { SIZES } from "../../src/cases/spec.js";
import { part, type BrowserScenario } from "./scenario.js";

/**
 * Tour has no unportalled half at all, so this is the first place the card is
 * compared anywhere.
 *
 * `Tour.Root` renders no element; the backdrop, spotlight, positioner, card,
 * arrow, title, description, progress text and action row all live in the
 * portal, which the SSR gate excludes outright. Everything below — `size`,
 * `variant`, `showProgress`, the Back/Next row, which button is `disabled`, the
 * "N of M" counter — is pinned here or nowhere.
 *
 * ── Why every case is a *closed* tour ───────────────────────────────────────
 *
 * Because on the machine `@ark-ui/react` bundles, a tour cannot be opened by a
 * prop — and that is worth pinning rather than working around. zag seeds its
 * `stepId` from the prop and moves into its running state from a **watch** on
 * that value, so a tour rendered with `stepId` already set has nothing to watch:
 * `start()` sets the id the machine already holds, the watch does not fire, and
 * the tour stays closed with its whole card rendered and `hidden`. The React
 * component's own documentation says as much — "open it after mount".
 *
 * The harness supplies a scenario's props once and never changes them, so there
 * is no step that can open a tour here. Driving a *running* tour needs a fixture
 * that sets `stepId` from a click, which is a change to the shared React spec
 * rather than to any port. What these cases do compare instead is everything the
 * card is made of, which is a great deal more than the SSR gate can see.
 *
 * A newer zag opens it, which is why Svelte and Vue are skipped here — see
 * `MACHINE_SKEW` below.
 *
 * ── Every step carries a `type` ─────────────────────────────────────────────
 *
 * A step with neither a `target` nor a `type` makes the machine throw
 * "Step one has no target or type" into the page, and the browser gate fails any
 * scenario that logs a page error. The SSR cases can leave it out because
 * nothing runs there; here it has to be said.
 */
const steps = [
  { id: "one", title: "One", description: "First step", type: "dialog" },
  { id: "two", title: "Two", description: "Second step", type: "dialog" },
  { id: "three", title: "Three", description: "Third step", type: "dialog" },
];

const regions = [
  part("tour", "backdrop"),
  part("tour", "spotlight"),
  part("tour", "positioner"),
];

/**
 * The two things Ark Svelte and Ark Vue do that Ark React does not, both of them
 * upstream and both of them in the same direction: the machine leads and the
 * React wrapper trails.
 *
 * 1. **A tour rendered with a `stepId` opens.** zag 1.43.3 added a `clearStep`
 *    to the START handler — `actions: ["clearStep", "setInitialStep", …]` where
 *    1.41.2 has `["setInitialStep", …]` — so the id is blanked and re-set, the
 *    watch on it fires, and the machine moves into `running`. On 1.41.2, which
 *    `@ark-ui/react` bundles, `setInitialStep` sets the id the machine already
 *    holds, nothing changes, and the tour stays closed with its card rendered.
 * 2. **The close trigger is a real button.** 1.43.3 normalises that part with
 *    `normalize.button({ type: "button", … })`; 1.41.2 uses `normalize.element`
 *    and emits no `type`.
 *
 * Check the zag version rather than the Ark one before concluding anything about
 * which side is newer: `@ark-ui/react` 5.37.2 bundles zag 1.41.2, while
 * `@ark-ui/svelte` 5.24.0 and `@ark-ui/vue` 5.39.0 both bundle 1.43.3. By
 * wrapper number Svelte looks the furthest behind and the split makes no sense;
 * by machine, Svelte and Vue agree and are ahead.
 *
 * Neither difference is a port's doing, and neither can be papered over with an
 * attribute allowance: the first one is the difference between an open tour and
 * a closed one, which is most of the contract rather than one attribute of it.
 * Angular follows React, because React is what it is compared against — so these
 * cases compare React and Angular, and the day Ark React ships the newer machine
 * they compare all four. The SSR gate compares Svelte and Vue for what it can
 * see of Tour today, which is that nothing escapes the portal.
 */
const MACHINE_SKEW =
  "zag 1.43.3 — the machine @ark-ui/svelte and @ark-ui/vue bundle — clears the " +
  "step id before setting it in the START handler, so a tour rendered with a " +
  "stepId opens; zag 1.41.2, the one @ark-ui/react bundles, sets the id it " +
  "already holds and the tour stays closed. The same version also turned the " +
  "close trigger into a real button with type=\"button\". Both are upstream " +
  "fixes the React wrapper has not picked up — no port did either — and the " +
  "first is the difference between an open card and a closed one rather than " +
  "one attribute, so it cannot be allowed away. Angular follows React, which is " +
  "the reference it is compared against. Remove this once Ark React ships zag " +
  "1.43 or later, at which point all four compare here.";

const ARK_TOUR_SKEW = [
  { framework: "svelte", reason: MACHINE_SKEW },
  { framework: "vue", reason: MACHINE_SKEW },
];

const tour = (name: string, props: Record<string, unknown>): BrowserScenario => ({
  component: "Tour",
  name,
  props,
  steps: [],
  regions,
  skip: ARK_TOUR_SKEW,
});

const scenarios: BrowserScenario[] = [
  // No step at all: the card renders empty, the progress reads "0 of 3", the
  // action row has no buttons in it, and the backdrop is `hidden` because there
  // is no step to ask for dimming.
  tour("no step", { steps, stepId: null }),
  // An id that names nothing is the same state, reached a different way — and
  // it is guarded by hand in every library, where an unguarded `start()` throws.
  tour("unknown step id", { steps, stepId: "nope" }),
  // The three positions in a sequence, which is what decides `disabled` on the
  // Back and Next buttons and what the counter reads.
  tour("first step", { steps, stepId: "one" }),
  tour("middle step", { steps, stepId: "two" }),
  tour("last step", { steps, stepId: "three" }),
  // One step is both the first and the last, so both buttons are disabled.
  tour("single step", { steps: steps.slice(0, 1), stepId: "one" }),
  /**
   * A `wait` step is the case where two counts deliberately disagree: it is
   * excluded from the progress text, which reads "0 of 1", while the Back and
   * Next buttons still count it as a place in the sequence and leave Next
   * enabled. And because it has no target it falls into the *dialog* branch of
   * the step normaliser, so it picks up `backdrop: true` from a branch it does
   * not belong to and renders an un-hidden backdrop.
   */
  tour("waiting step", {
    steps: [{ ...steps[0], type: "wait" }, steps[1]],
    stepId: "one",
  }),
  // A step that asks for no dimming: the backdrop is `hidden` while the card is
  // not, which is the one place the two come apart.
  tour("no backdrop", {
    steps: [{ ...steps[0], backdrop: false }, steps[1]],
    stepId: "one",
  }),
  // A caller's own action row. `skip` is not one of the machine's three named
  // actions, so it comes out `data-type="custom"` with no `aria-label` and no
  // disabled state — three differences from a Back/Next button at once.
  tour("explicit actions", {
    steps: [
      { ...steps[0], actions: [{ label: "Skip", action: "skip" }] },
      { ...steps[1], actions: [{ label: "Done", action: "dismiss" }] },
    ],
    stepId: "one",
  }),
  tour("no progress", { steps, stepId: "one", showProgress: false }),
  // The size reaches two places at once: the card's recipe and the two action
  // buttons, which are the library Button projected through Ark's asChild.
  ...SIZES.map((size) => tour(`size/${size}`, { steps, stepId: "one", size })),
  ...(["default", "compact"] as const).map((variant) =>
    tour(`variant/${variant}`, { steps, stepId: "one", variant }),
  ),
  tour("spotlight radius", { steps, stepId: "one", spotlightRadius: 16 }),
  tour("prevent interaction", { steps, stepId: "one", preventInteraction: true }),
  tour("no dismissal", {
    steps,
    stepId: "one",
    closeOnEscape: false,
    closeOnInteractOutside: false,
  }),
];

export default scenarios;
