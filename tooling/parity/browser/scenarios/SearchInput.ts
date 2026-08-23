import { ARK_ERROR_TEXT_SKEW, staticScenarios, type BrowserScenario } from "./scenario.js";

const SIZES = ["sm", "md", "lg"] as const;
const CLEAR = "button.input-affix__action";
const CONTROL = ".field__control";

const scenarios: BrowserScenario[] = [
  ...staticScenarios("SearchInput", [
    { name: "default" },
    { name: "with label", props: { label: "Search" } },
    { name: "required", props: { label: "Search", required: true } },
    { name: "helper text", props: { label: "Search", helperText: "Type to filter" } },
    {
      name: "error message",
      props: { label: "Search", error: "Required" },
      skip: ARK_ERROR_TEXT_SKEW,
    },
    { name: "invalid without message", props: { label: "Search", error: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "S" } })),
    { name: "disabled", props: { label: "Search", disabled: true } },
    { name: "placeholder", props: { placeholder: "Search" } },
    /**
     * With a value the clear button appears and takes the control's trailing
     * padding class with it. React mirrors the value into state and re-syncs it
     * from an effect, Svelte derives it, and Angular's `model()` is what the
     * element shows — three routes that have to land on the same markup.
     */
    { name: "uncontrolled value", props: { defaultValue: "cat" } },
    { name: "controlled value", props: { value: "cat" } },
    { name: "empty controlled value", props: { value: "" } },
    { name: "not clearable", props: { defaultValue: "cat", clearable: false } },
    /**
     * A disabled field shows no clear button even holding a value — not because
     * it would be pressable, but because the padding it reserves is layout.
     */
    { name: "disabled with value", props: { defaultValue: "cat", disabled: true } },
  ]),
  {
    component: "SearchInput",
    name: "cleared",
    props: { defaultValue: "cat" },
    /**
     * Clearing removes the button that was just clicked, so focus has to be put
     * somewhere deliberately — on the control, which is where a user who has
     * just cleared a search is about to type. Left alone it would land on
     * `document.body`.
     */
    steps: [
      { do: "click", target: CLEAR },
      { do: "wait", target: `${CONTROL}:not(.field__control--affix-end)` },
      { do: "awaitFocus", target: CONTROL },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
