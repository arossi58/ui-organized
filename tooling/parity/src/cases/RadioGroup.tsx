import type { ComponentType } from "react";
import { RadioGroup as RRadioGroup } from "@ui-organized/react";
import RadioGroupFixture from "../fixtures/RadioGroupFixture.svelte";
import VueRadioGroupFixture from "../fixtures/vue/RadioGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "RadioGroup",
  react: (p) => <RRadioGroup {...(p as any)} />,
  svelte: RadioGroupFixture as unknown as ComponentType<any>,
  vue: VueRadioGroupFixture as unknown as ComponentType<any>,
  cases: (() => {
    const options = [
      { value: "a", label: "Apple" },
      { value: "b", label: "Banana" },
      { value: "c", label: "Cherry", disabled: true },
    ];
    return [
      { name: "default", props: { options } },
      // The group label is a sibling of Ark's Root, so its id is handed to
      // Ark explicitly; without a label the reference is dropped instead.
      { name: "with label", props: { options, label: "Fruit" } },
      { name: "no label, aria-label", props: { options, "aria-label": "Fruit" } },
      { name: "selected", props: { options, defaultValue: "b" } },
      { name: "horizontal", props: { options, orientation: "horizontal" } },
      { name: "group disabled", props: { options, disabled: true, label: "Fruit" } },
      { name: "named", props: { options, name: "fruit", label: "Fruit" } },
      {
        name: "option error",
        props: {
          options: [{ value: "a", label: "Apple", error: "Out of stock" }],
          label: "Fruit",
        },
      },
    ];
  })(),
};

export default spec;
