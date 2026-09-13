import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The cells, and then what typing into them does.
 *
 * Almost every state here lives on the *cells* rather than on the root — the
 * per-cell `type`, `data-filled` and `aria-label`, and the one cell in the tab
 * order — so a port that got the root right and the loop wrong would pass a
 * root-only comparison. The SSR gate covers these for the other three; Angular
 * is compared in the browser only, so they are repeated here.
 */
const SIZES = ["sm", "md", "lg"] as const;
const CONTROL = part("pin-input", "control");
const cell = (index: number) => `${part("pin-input", "input")}[data-index="${index}"]`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("PinInput", [
    { name: "default" },
    { name: "with label", props: { label: "Code" } },
    { name: "required", props: { label: "Code", required: true } },
    { name: "helper text", props: { label: "Code", helperText: "Six digits" } },
    { name: "error message", props: { label: "Code", error: "Wrong code" } },
    { name: "invalid without message", props: { label: "Code", error: true } },
    { name: "helper hidden by error", props: { label: "C", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Code" } })),
    { name: "variant/underline", props: { variant: "underline" } },
    // The cell count is what `length` drives: one Input part per cell, each
    // carrying its own index into the machine.
    { name: "length 6", props: { length: 6 } },
    { name: "length 1", props: { length: 1 } },
    /**
     * `mask` and `type` between them decide the input's `type`, which is the one
     * per-cell attribute the comparison actually reads: `password` when masked,
     * `tel` for digits, `text` for letters.
     */
    { name: "mask", props: { mask: true } },
    { name: "otp", props: { otp: true } },
    { name: "placeholder", props: { placeholder: "-" } },
    { name: "blur on complete", props: { blurOnComplete: true } },
    { name: "type/alphanumeric", props: { type: "alphanumeric" } },
    { name: "type/alphabetic", props: { type: "alphabetic" } },
    { name: "disabled", props: { label: "Code", disabled: true } },
    { name: "read only", props: { label: "Code", readOnly: true } },
    // The string facade is split one character per cell at the boundary; a
    // short string leaves the remaining cells empty rather than shrinking.
    { name: "default value", props: { defaultValue: "1234" } },
    { name: "controlled value", props: { value: "12" } },
    { name: "value longer than length", props: { length: 3, value: "12345" } },
    { name: "named", props: { name: "otp", label: "Code" } },
  ]),
  {
    /**
     * Two keystrokes, which is the whole of what a pin input is for and none of
     * which a static render reaches: the cell that was typed into gains
     * `data-filled`, and focus has moved on to the next one.
     */
    component: "PinInput",
    name: "typed into",
    props: { length: 4 },
    steps: [
      { do: "click", target: cell(0) },
      { do: "awaitFocus", target: CONTROL },
      { do: "press", key: "1" },
      { do: "press", key: "2" },
      { do: "wait", target: `${cell(1)}[data-filled]` },
    ],
    regions: ["#mount"],
  },
  {
    /**
     * Filling the last cell puts `data-complete` on the root, the label and
     * every cell at once — the state a caller submits on, and the only one that
     * spans all three levels of the component.
     */
    component: "PinInput",
    name: "completed",
    props: { length: 2, label: "Code" },
    steps: [
      { do: "click", target: cell(0) },
      { do: "awaitFocus", target: CONTROL },
      { do: "press", key: "1" },
      { do: "press", key: "2" },
      { do: "wait", target: `${part("pin-input", "root")}[data-complete]` },
    ],
    regions: ["#mount"],
  },
  {
    /**
     * Backspace *shifts* the code left rather than blanking one cell, so the
     * cell that was cleared reports `data-filled` from the character that moved
     * into it. A port that blanked in place would look right until this case.
     */
    component: "PinInput",
    name: "backspaced",
    // Uncontrolled: a `value` prop pins the machine to the caller's string, so
    // backspace would have nothing to change.
    props: { length: 3, defaultValue: "123" },
    steps: [
      { do: "click", target: cell(2) },
      { do: "awaitFocus", target: CONTROL },
      { do: "press", key: "Backspace" },
      { do: "wait", target: `${part("pin-input", "root")}:not([data-complete])` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
