import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The preview, the input, and everything about them that holds still.
 *
 * Both halves are mounted at once and `hidden` picks between them, so what is
 * compared here is the resting half. The SSR gate covers these for the other
 * three; Angular is compared in the browser only, so they are repeated here.
 *
 * ── Why the edit itself is not driven here ──────────────────────────────────
 *
 * `@ark-ui/react` 5.37 — zag 1.41 — does not enter edit mode at all in a real
 * browser: clicking the preview, focusing it, double-clicking it and pressing
 * the Edit trigger all leave the input `hidden` and focus on the preview.
 * `@ark-ui/svelte` and `@ark-ui/vue`, on zag 1.43, all four routes work. React
 * is this gate's reference, so an editing Editable has nothing to be compared
 * *against* — a scenario would fail on React's own step rather than on a port.
 *
 * Starting an edit, committing one, and cancelling one are asserted in
 * `editable.spec.ts` instead. Re-check this the moment Ark React ships the
 * newer machine: the interactive cases belong here, not there.
 */
const SIZES = ["sm", "md", "lg"] as const;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Editable", [
    { name: "default" },
    { name: "with label", props: { label: "Name" } },
    { name: "required", props: { label: "Name", required: true } },
    { name: "helper text", props: { label: "Name", helperText: "Click to edit" } },
    { name: "error message", props: { label: "Name", error: "Too short" } },
    { name: "invalid without message", props: { label: "Name", error: true } },
    { name: "helper hidden by error", props: { label: "N", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Name" } })),
    // The preview carries the value as its own text and swaps with the input on
    // edit; both are mounted, and `hidden` is what picks between them.
    { name: "default value", props: { defaultValue: "Ada" } },
    { name: "controlled value", props: { value: "Ada" } },
    // Empty is a state of its own: [data-placeholder-shown] is what colours the
    // preview like a placeholder rather than like a value.
    { name: "placeholder", props: { placeholder: "Add a name" } },
    { name: "placeholder with value", props: { placeholder: "Add a name", defaultValue: "Ada" } },
    { name: "activation/dblclick", props: { activationMode: "dblclick" } },
    { name: "activation/click", props: { activationMode: "click" } },
    { name: "activation/none", props: { activationMode: "none" } },
    { name: "submit/enter", props: { submitMode: "enter" } },
    { name: "submit/both", props: { submitMode: "both" } },
    { name: "auto resize", props: { autoResize: true, defaultValue: "Ada" } },
    { name: "max length", props: { maxLength: 10 } },
    // The three triggers are mounted together and separated by `hidden`, so
    // this is the case that pins the whole control row.
    { name: "show controls", props: { showControls: true, defaultValue: "Ada" } },
    ...SIZES.map((size) => ({
      name: `show controls/${size}`,
      props: { showControls: true, size },
    })),
    { name: "disabled", props: { label: "Name", disabled: true, defaultValue: "Ada" } },
    { name: "read only", props: { label: "Name", readOnly: true, defaultValue: "Ada" } },
    { name: "named", props: { name: "display-name", defaultValue: "Ada" } },
  ]),
];

export default scenarios;
