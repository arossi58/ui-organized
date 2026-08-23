import type { ComponentType } from "react";
import { SegmentedControl as RSegmentedControl } from "@ui-organized/react";
import SegmentedControlFixture from "../fixtures/SegmentedControlFixture.svelte";
import VueSegmentedControlFixture from "../fixtures/vue/SegmentedControlFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const items = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
];

const spec: ParitySpec = {
  component: "SegmentedControl",
  react: (p) => <RSegmentedControl {...(p as any)} />,
  svelte: SegmentedControlFixture as unknown as ComponentType<any>,
  vue: VueSegmentedControlFixture as unknown as ComponentType<any>,
  cases: [
    // No Label part is rendered, so Ark's aria-labelledby would name an element
    // that does not exist — the case OMIT_ARIA is here for.
    { name: "default", props: { items } },
    { name: "aria-label", props: { items, "aria-label": "Range" } },
    { name: "selected", props: { items, defaultValue: "week" } },
    { name: "controlled", props: { items, value: "week" } },
    { name: "disabled", props: { items, disabled: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { items, size } })),
    { name: "named", props: { items, name: "range" } },
    {
      name: "with icons",
      props: {
        items: [
          { value: "yes", label: "Yes", icon: "check" },
          { value: "no", label: "No", icon: "close" },
        ],
      },
    },
    { name: "single item", props: { items: [{ value: "only", label: "Only" }] } },
  ],
};

export default spec;
