import { ARK_ERROR_TEXT_SKEW, part, staticScenarios, type BrowserScenario } from "./scenario.js";

const SIZES = ["sm", "md", "lg"] as const;
const INCREMENT = part("number-input", "increment-trigger");
const INPUT = part("number-input", "input");

const scenarios: BrowserScenario[] = [
  ...staticScenarios("NumberField", [
    { name: "default" },
    { name: "with label", props: { label: "Quantity" } },
    { name: "required", props: { label: "Quantity", required: true } },
    { name: "helper text", props: { label: "Quantity", helperText: "How many" } },
    {
      name: "error message",
      props: { label: "Quantity", error: "Too low" },
      skip: ARK_ERROR_TEXT_SKEW,
    },
    { name: "invalid without message", props: { label: "Quantity", error: true } },
    {
      name: "helper hidden by error",
      props: { label: "Q", helperText: "H", error: "Bad" },
      skip: ARK_ERROR_TEXT_SKEW,
    },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Q" } })),
    /**
     * Unlike `Input`, the *field* root reports `data-disabled` here: React passes
     * `disabled` to `Field.Root`, so the label greys with the control. `readOnly`
     * and `required` are not passed on, and no part of the field reports them.
     */
    { name: "disabled", props: { label: "Quantity", disabled: true } },
    /** Read-only disables **both** steppers while the input stays focusable. */
    { name: "read only", props: { label: "Quantity", readOnly: true } },
    { name: "placeholder", props: { placeholder: "0" } },
    { name: "default value", props: { defaultValue: 3 } },
    /**
     * At a bound one stepper goes `disabled` + `data-disabled` and the other
     * stays live. The empty case above is the same rule read the other way:
     * with no `min` the decrement stepper is enabled on an empty field, because
     * the default minimum is `Number.MIN_SAFE_INTEGER` rather than zero.
     */
    { name: "at min", props: { defaultValue: 0, min: 0, max: 10 } },
    { name: "at max", props: { defaultValue: 10, min: 0, max: 10 } },
    /**
     * Out of range, which is *not* an invalid field. Zag falls back to its own
     * range check only when no Field supplies `invalid`, and here one always
     * does — so the value reports `aria-valuenow="20"` past a maximum of 10 with
     * no `data-invalid` anywhere, and only the increment stepper notices.
     */
    { name: "out of range", props: { defaultValue: 20, min: 0, max: 10 } },
    { name: "step", props: { defaultValue: 2, step: 0.5 } },
    /** A controlled empty value: `null` on the facade, an empty string in the DOM. */
    { name: "controlled null", props: { value: null } },
    { name: "controlled value", props: { value: 7 } },
    /**
     * Formatting drops the input's `pattern` — a currency string is not what
     * that regex describes — and `aria-valuenow` still carries the number the
     * formatted text stands for.
     */
    {
      name: "formatted",
      props: { defaultValue: 12, format: { style: "currency", currency: "USD" } },
    },
    { name: "named", props: { name: "qty", label: "Quantity" } },
  ]),
  {
    component: "NumberField",
    name: "incremented",
    props: { defaultValue: 3, min: 0, max: 4 },
    /**
     * One press of a stepper, which moves three things: the value, the stepper
     * that has just reached its bound, and `data-focus` on the number-input root
     * and control — a stepper hands focus to the input rather than taking it.
     */
    steps: [
      { do: "click", target: INCREMENT },
      { do: "wait", target: `${INPUT}[aria-valuenow="4"]` },
      { do: "wait", target: `${INCREMENT}[data-disabled]` },
      { do: "awaitFocus", target: INPUT },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
