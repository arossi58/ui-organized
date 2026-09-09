import type { ParityAllowance } from "../../src/cases/spec.js";
import { part, type BrowserScenario } from "./scenario.js";

/**
 * The list, the panels and the two buttons that move between them.
 *
 * The SSR gate covers the resting states for the other three; Angular is
 * compared in the browser only, so they are repeated here, and the three
 * interactive cases at the end reach what a static render cannot: the step
 * actually changing, and a linear flow refusing to let it.
 */
const SIZES = ["sm", "md", "lg"] as const;
const STEPS = [
  { title: "One", content: "first" },
  { title: "Two", description: "second step", content: "second" },
  { title: "Three", content: "third" },
];
const trigger = (index: number) => `${part("steps", "trigger")}[id$=":${index}"]`;

/**
 * zag 1.43 — the machine `@ark-ui/svelte` and `@ark-ui/vue` bundle, and the one
 * the Angular port reproduces — puts `type="button"` on the step trigger; zag
 * 1.41, the one `@ark-ui/react` bundles, does not. Note which way round that is:
 * the wrappers trail and the machine leads, so React *gains* the attribute
 * rather than the other three losing it.
 *
 * Kept rather than stripped, because `type="button"` on a `<button>` inside a
 * form is a real guard against a step trigger submitting it, and `Steps.css`
 * selects on nothing derived from `type` — the assertion below fails the moment
 * it starts to. Remove this once Ark React ships the newer machine.
 *
 * The same allowance the SSR gate's `cases/Steps.tsx` carries, for the same
 * reason and with the same expiry.
 */
const TYPE_SKEW: ParityAllowance = {
  attribute: "type",
  reason:
    'zag 1.43 adds type="button" to the step trigger and zag 1.41, which ' +
    "@ark-ui/react bundles, does not. Steps.css selects on neither [type] nor " +
    "the element it sits on, so nothing renders differently, and the Back and " +
    "Next buttons this also blinds are the library Button, whose own type is " +
    "gated by cases/Button.tsx.",
};

/** Every Steps case needs the allowance above, so none of them states it twice. */
const steps = (
  name: string,
  props: Record<string, unknown>,
  interaction: Pick<BrowserScenario, "steps"> = { steps: [] },
): BrowserScenario => ({
  component: "Steps",
  name,
  props,
  regions: ["#mount"],
  stylesheets: ["Steps/Steps.css"],
  allow: [TYPE_SKEW],
  ...interaction,
});

const scenarios: BrowserScenario[] = [
  steps("default", { steps: STEPS }),
  // Every step past the current one is `data-incomplete`, the ones before it
  // `data-complete`, and all three land on the trigger, the indicator and the
  // separator together.
  steps("current step", { steps: STEPS, defaultStep: 1 }),
  steps("all complete", { steps: STEPS, defaultStep: 3 }),
  steps("controlled step", { steps: STEPS, step: 2 }),
  steps("linear", { steps: STEPS, linear: true }),
  steps("no descriptions", { steps: [{ title: "One" }, { title: "Two" }] }),
  steps("single step", { steps: [{ title: "Only", content: "just this" }] }),
  // The panels, the completed panel and the two actions all disappear
  // together — the list is the whole component in this mode.
  steps("no content", { steps: STEPS, showContent: false }),
  steps("completed content", { steps: STEPS, completedContent: "All done" }),
  ...(["horizontal", "vertical"] as const).map((orientation) =>
    steps(`orientation/${orientation}`, { steps: STEPS, orientation }),
  ),
  ...(["numbered", "dotted"] as const).map((variant) =>
    steps(`variant/${variant}`, { steps: STEPS, variant }),
  ),
  // The size reaches two places at once: the root recipe and the intent of the
  // Back/Next buttons, which are the library Button projected through asChild.
  ...SIZES.map((size) => steps(`size/${size}`, { steps: STEPS, size })),
  steps("custom class", { steps: STEPS, className: "mine" }),
  steps("advanced", { steps: STEPS }, {
    /**
     * One press of Next, which moves five things at once: the panel that is
     * open, the step that is current, the one behind it that is now complete,
     * the separator between them, and `--percent` on the root.
     */
    steps: [
      { do: "click", target: part("steps", "next-trigger") },
      { do: "wait", target: `${trigger(1)}[data-current]` },
    ],
  }),
  steps("stepped back to", { steps: STEPS, defaultStep: 2 }, {
    steps: [
      { do: "click", target: part("steps", "prev-trigger") },
      { do: "wait", target: `${trigger(1)}[data-current]` },
    ],
  }),
  steps("linear ignores a jump", { steps: STEPS, linear: true }, {
    /**
     * The linear guard, which has no attribute of its own: clicking a step
     * ahead of the current one simply does nothing, so what is compared is that
     * *nothing moved*. The wait is on the first step still being current, which
     * would fail rather than time out if the click had been honoured.
     */
    steps: [
      { do: "click", target: trigger(2) },
      { do: "wait", target: `${trigger(0)}[data-current]` },
    ],
  }),
];

export default scenarios;
