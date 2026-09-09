import type { ComponentType } from "react";
import { Select as RSelect } from "@ui-organized/react";
import SelectFixture from "../fixtures/SelectFixture.svelte";
import VueSelectFixture from "../fixtures/vue/SelectFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Select",
  react: (p) => <RSelect {...(p as any)} />,
  svelte: SelectFixture as unknown as ComponentType<any>,
  vue: VueSelectFixture as unknown as ComponentType<any>,
  // Everything except the popup: the field chrome, the trigger and the hidden
  // native select are all rendered in place, and all three carry ARIA that
  // OMIT_ARIA is responsible for.
  exclude: '[data-scope="select"][data-part="positioner"]',
  allowTextIn: [
    {
      selector: "select option",
      reason:
        "Ark Vue's HiddenSelect renders an option's text as \"Apple > \" where " +
        "Ark React renders \"Apple\" — it stringifies through the collection's " +
        "path join. The element is the hidden native select, which exists only " +
        "so the value is submitted with a form: it is aria-hidden and visually " +
        "hidden, the submitted value is the option's `value` rather than its " +
        "text, and no user or screen reader ever encounters the difference. " +
        "The assertion below fails if that element ever stops being aria-hidden.",
    },
  ],
  cases: (() => {
    const options = [
      { value: "a", label: "Apple" },
      { value: "b", label: "Banana" },
      { value: "c", label: "Cherry", disabled: true },
    ];
    return [
      { name: "default", props: { options } },
      { name: "with label", props: { options, label: "Fruit" } },
      // No Label part exists without a label, so Ark's aria-labelledby on the
      // trigger, listbox and hidden select would all dangle. OMIT_ARIA sheds
      // them; this is what pins that across three separate elements.
      { name: "no label", props: { options, placeholder: "Pick one" } },
      { name: "required", props: { options, label: "Fruit", required: true } },
      { name: "helper text", props: { options, label: "Fruit", helperText: "Choose" } },
      { name: "error", props: { options, label: "Fruit", error: "Required" } },
      { name: "selected", props: { options, defaultValue: "b", label: "Fruit" } },
      { name: "disabled", props: { options, label: "Fruit", disabled: true } },
      // Ghost hides the label but still renders it, because three separate
      // ARIA references point at the Label part.
      { name: "ghost", props: { options, label: "Fruit", variant: "ghost" } },
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { options, size, label: "F" } })),
    ];
  })(),
};

export default spec;
