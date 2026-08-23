import type { ComponentType } from "react";
import { Combobox as RCombobox } from "@ui-organized/react";
import ComboboxFixture from "../fixtures/ComboboxFixture.svelte";
import VueComboboxFixture from "../fixtures/vue/ComboboxFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Combobox",
  react: (p) => <RCombobox {...(p as any)} />,
  svelte: ComboboxFixture as unknown as ComponentType<any>,
  vue: VueComboboxFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="combobox"][data-part="positioner"]',
  cases: (() => {
    const options = [
      { value: "a", label: "Apple" },
      { value: "b", label: "Banana" },
      { value: "c", label: "Cherry", disabled: true },
    ];
    return [
      { name: "default", props: { options } },
      { name: "with label", props: { options, label: "Fruit" } },
      { name: "placeholder", props: { options, placeholder: "Search" } },
      { name: "required", props: { options, label: "Fruit", required: true } },
      { name: "helper text", props: { options, label: "Fruit", helperText: "Type to filter" } },
      { name: "error", props: { options, label: "Fruit", error: "Required" } },
      { name: "selected", props: { options, defaultValue: "b", label: "Fruit" } },
      { name: "disabled", props: { options, label: "Fruit", disabled: true } },
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { options, size, label: "F" } })),
    ];
  })(),
};

export default spec;
