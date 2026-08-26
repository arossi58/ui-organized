import type { ComponentType } from "react";
import { SearchInput as RSearchInput } from "@ui-organized/react";
import SearchInputFixture from "../fixtures/SearchInputFixture.svelte";
import VueSearchInputFixture from "../fixtures/vue/SearchInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "SearchInput",
  react: (p) => <RSearchInput {...p} />,
  svelte: SearchInputFixture as unknown as ComponentType<any>,
  vue: VueSearchInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Search" } },
    { name: "required", props: { label: "Search", required: true } },
    { name: "helper text", props: { label: "Search", helperText: "Type to filter" } },
    { name: "error message", props: { label: "Search", error: "Required" } },
    { name: "invalid without message", props: { label: "Search", error: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "S" } })),
    { name: "disabled", props: { label: "Search", disabled: true } },
    { name: "placeholder", props: { placeholder: "Search" } },
    // The clear button appears with a value and takes the control's trailing
    // padding class with it. React mirrors the value into state and re-syncs it
    // from an effect; Svelte derives it. Both have to land on the same markup.
    { name: "uncontrolled value", props: { defaultValue: "cat" } },
    { name: "controlled value", props: { value: "cat" } },
    { name: "empty controlled value", props: { value: "" } },
    { name: "not clearable", props: { defaultValue: "cat", clearable: false } },
    { name: "disabled with value", props: { defaultValue: "cat", disabled: true } },
  ],
};

export default spec;
