import type { ComponentType } from "react";
import { RatingGroup as RRatingGroup } from "@ui-organized/react";
import RatingGroupFixture from "../fixtures/RatingGroupFixture.svelte";
import VueRatingGroupFixture from "../fixtures/vue/RatingGroupFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "RatingGroup",
  react: (p) => <RRatingGroup {...p} />,
  svelte: RatingGroupFixture as unknown as ComponentType<any>,
  vue: VueRatingGroupFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Rating" } },
    { name: "required", props: { label: "Rating", required: true } },
    { name: "helper text", props: { label: "Rating", helperText: "Out of five" } },
    { name: "error message", props: { label: "Rating", error: "Pick one" } },
    { name: "invalid without message", props: { label: "Rating", error: true } },
    { name: "helper hidden by error", props: { label: "R", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Rating" } })),
    { name: "variant/warning", props: { variant: "warning" } },
    // The item list comes from the machine rather than from `count` directly,
    // so a wrong count shows up as a missing or extra Item part.
    { name: "count 3", props: { count: 3 } },
    { name: "count 10", props: { count: 10 } },
    // [data-highlighted] is what the fill is styled off, so a filled rating is
    // the case that proves the value reached the machine.
    { name: "default value", props: { defaultValue: 3 } },
    { name: "controlled value", props: { value: 2 } },
    { name: "allow half", props: { allowHalf: true, defaultValue: 2.5 } },
    { name: "read only", props: { readOnly: true, defaultValue: 4 } },
    { name: "disabled", props: { disabled: true, defaultValue: 4 } },
    { name: "named", props: { name: "score", label: "Rating" } },
  ],
};

export default spec;
