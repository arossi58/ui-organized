import type { ComponentType } from "react";
import { Listbox as RListbox } from "@ui-organized/react";
import VueListboxFixture from "../fixtures/vue/ListboxFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const OPTIONS = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

const GROUPED = [
  { value: "a", label: "Apple", group: "Fruit" },
  { value: "b", label: "Banana", group: "Fruit" },
  { value: "n", label: "Almond" },
  { value: "c", label: "Cashew", group: "Nut" },
];

const spec: ParitySpec = {
  component: "Listbox",
  react: (p) => <RListbox {...(p as any)} />,
  // No Svelte fixture: Listbox is not in that package yet.
  vue: VueListboxFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { options: OPTIONS } },
    { name: "with label", props: { options: OPTIONS, label: "Fruit" } },
    { name: "selected", props: { options: OPTIONS, defaultValue: ["b"] } },
    // Controlled, which is the one place the two libraries spell the prop
    // differently — `value` in React, `modelValue` in Vue, because Ark Vue
    // renames it. The fixture does the rename; this pins that it happened.
    { name: "controlled", props: { options: OPTIONS, value: ["a"] } },
    { name: "multiple", props: { options: OPTIONS, selectionMode: "multiple" } },
    { name: "extended", props: { options: OPTIONS, selectionMode: "extended" } },
    { name: "disabled", props: { options: OPTIONS, disabled: true } },
    { name: "bordered", props: { options: OPTIONS, variant: "bordered" } },
    // A partially grouped list: the ungrouped bucket must stay unwrapped, or a
    // screen reader is told about a group with no name.
    { name: "grouped", props: { options: GROUPED } },
    // Empty renders Ark's Empty part and nothing else.
    { name: "empty", props: { options: [] } },
    { name: "empty message", props: { options: [], emptyMessage: "Nothing here" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { options: OPTIONS, size } })),
  ],
};

export default spec;
