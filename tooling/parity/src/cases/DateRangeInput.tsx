import type { ComponentType } from "react";
import { DateRangeInput as RDateRangeInput } from "@ui-organized/react";
import DateRangeInputFixture from "../fixtures/DateRangeInputFixture.svelte";
import VueDateRangeInputFixture from "../fixtures/vue/DateRangeInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "DateRangeInput",
  react: (p) => <RDateRangeInput {...p} />,
  svelte: DateRangeInputFixture as unknown as ComponentType<any>,
  vue: VueDateRangeInputFixture as unknown as ComponentType<any>,
  // See DateInput.tsx — the shared two-month calendar is portalled.
  exclude: '[data-scope="popover"][data-part="positioner"]',
  cases: [
    // The group is a plain <div role="group"> rather than an Ark Field, so its
    // accessible name and description are wired by hand from a generated id.
    // Nothing else in this suite compares three hand-built IDREFs at once.
    { name: "default" },
    { name: "with label", props: { label: "Stay" } },
    { name: "required", props: { label: "Stay", required: true } },
    { name: "helper text", props: { label: "Stay", helperText: "Nights included" } },
    { name: "error message", props: { label: "Stay", error: "Required" } },
    { name: "invalid without message", props: { label: "Stay", error: true } },
    { name: "helper hidden by error", props: { label: "S", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "S" } })),
    { name: "disabled", props: { label: "Stay", disabled: true } },
    { name: "named ends", props: { startName: "from", endName: "to", label: "Stay" } },
    // The two ends' accessible names, which are also the picker buttons' names.
    { name: "custom end labels", props: { startLabel: "From", endLabel: "To", label: "Stay" } },
    { name: "custom separator", props: { separator: "to", label: "Stay" } },
    { name: "with a value", props: { defaultValue: { start: "2024-03-01", end: "2024-03-08" } } },
    // Only one end filled: the other keeps `data-empty`, and the filled end
    // becomes the other's bound.
    { name: "half filled", props: { defaultValue: { start: "2024-03-01", end: "" } } },
    { name: "bounded", props: { min: "2024-01-01", max: "2024-12-31", label: "S" } },
    { name: "explicit id", props: { id: "stay", label: "Stay" } },
  ],
};

export default spec;
