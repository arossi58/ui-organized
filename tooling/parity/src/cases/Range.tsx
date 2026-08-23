import type { ComponentType } from "react";
import { Range as RRange } from "@ui-organized/react";
import RangeFixture from "../fixtures/RangeFixture.svelte";
import VueRangeFixture from "../fixtures/vue/RangeFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Range",
  react: (p) => <RRange {...p} />,
  svelte: RangeFixture as unknown as ComponentType<any>,
  vue: VueRangeFixture as unknown as ComponentType<any>,
  cases: [
    // No Label part is rendered — the caption is a Field.Label — so Ark's
    // aria-labelledby on the thumb would name an element that does not exist.
    // That is the case OMIT_ARIA is here for.
    { name: "default" },
    { name: "aria-label", props: { "aria-label": "Volume" } },
    { name: "with label", props: { label: "Volume" } },
    { name: "hide value", props: { label: "Volume", hideValue: true } },
    { name: "label and aria-label", props: { label: "Volume", "aria-label": "Ignored" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Volume" } })),
    { name: "error message", props: { label: "Volume", error: "Too loud" } },
    { name: "invalid without message", props: { label: "Volume", error: true } },
    { name: "disabled", props: { label: "Volume", disabled: true } },
    { name: "default value", props: { defaultValue: 40 } },
    { name: "controlled value", props: { value: 60 } },
    { name: "min max", props: { min: 10, max: 20, defaultValue: 15 } },
    { name: "step", props: { min: 0, max: 100, step: 25, defaultValue: 50 } },
    // Below `min` and above `max` are both clamped before the machine sees
    // them, so the thumb cannot start off the track.
    { name: "default below min", props: { min: 10, max: 20, defaultValue: 0 } },
    { name: "default above max", props: { min: 10, max: 20, defaultValue: 99 } },
    // Snap values take over min/max/step and drive the slider by index, so the
    // machine's bounds become 0..n-1 while the readout stays in real units.
    { name: "snap values", props: { snapValues: [1, 2, 4, 8], defaultValue: 4 } },
    { name: "snap values unsorted", props: { snapValues: [8, 1, 4, 2], defaultValue: 2 } },
    { name: "snap value between points", props: { snapValues: [0, 10, 100], defaultValue: 40 } },
    { name: "range labels", props: { rangeLabels: true } },
    { name: "range labels with bounds", props: { rangeLabels: true, min: 5, max: 25 } },
    { name: "custom range labels", props: { rangeLabels: true, startLabel: "Low", endLabel: "High" } },
    { name: "format value", props: { defaultValue: 30, formatValue: (v: number) => `${v}%` } },
    { name: "named", props: { name: "volume", label: "Volume" } },
    { name: "explicit id", props: { id: "volume-range", label: "Volume" } },
  ],
};

export default spec;
