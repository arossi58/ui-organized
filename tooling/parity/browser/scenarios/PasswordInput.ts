import { ARK_ERROR_TEXT_SKEW, staticScenarios, type BrowserScenario } from "./scenario.js";

const SIZES = ["sm", "md", "lg"] as const;
const TOGGLE = "button.input-affix__action";

const scenarios: BrowserScenario[] = [
  ...staticScenarios("PasswordInput", [
    { name: "default" },
    { name: "with label", props: { label: "Password" } },
    { name: "required", props: { label: "Password", required: true } },
    { name: "helper text", props: { label: "Password", helperText: "8 characters" } },
    {
      name: "error message",
      props: { label: "Password", error: "Too short" },
      skip: ARK_ERROR_TEXT_SKEW,
    },
    { name: "invalid without message", props: { label: "Password", error: true } },
    {
      name: "helper hidden by error",
      props: { label: "P", helperText: "H", error: "Bad" },
      skip: ARK_ERROR_TEXT_SKEW,
    },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "P" } })),
    /**
     * Disabling reaches the toggle button as well as the control — and *no*
     * part of the field reports `data-disabled`, because React passes only
     * `invalid` to `Field.Root`. Both halves of that are easy to get wrong in
     * opposite directions.
     */
    { name: "disabled", props: { label: "Password", disabled: true } },
    /** Without the toggle the control loses its trailing padding class too. */
    { name: "no toggle", props: { label: "Password", showToggle: false } },
    { name: "placeholder", props: { placeholder: "Your password" } },
    { name: "named", props: { name: "password", label: "Password" } },
  ]),
  {
    component: "PasswordInput",
    name: "revealed",
    props: { label: "Password" },
    /**
     * The state a static render cannot reach: the control's `type` flips to
     * `text`, and the button's `aria-pressed` and `aria-label` flip with it.
     * Labelled by what it will *do* rather than by what it is showing, which is
     * the pairing screen-reader users depend on and the one most often inverted.
     */
    steps: [
      { do: "click", target: TOGGLE },
      { do: "wait", target: `${TOGGLE}[aria-pressed="true"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
