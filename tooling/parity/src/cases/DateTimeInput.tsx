import type { ComponentType } from "react";
import { DateTimeInput as RDateTimeInput } from "@ui-organized/react";
import DateTimeInputFixture from "../fixtures/DateTimeInputFixture.svelte";
import VueDateTimeInputFixture from "../fixtures/vue/DateTimeInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "DateTimeInput",
  react: (p) => <RDateTimeInput {...p} />,
  svelte: DateTimeInputFixture as unknown as ComponentType<any>,
  vue: VueDateTimeInputFixture as unknown as ComponentType<any>,
  // See DateInput.tsx — the calendar popup is portalled and cannot be compared
  // by a static render.
  exclude: '[data-scope="popover"][data-part="positioner"]',
  cases: [
    // `type` is the whole difference between this and DateInput, and `type` is
    // part of the compared contract — so this row is what stops the two
    // fourteen-line wrappers from collapsing into each other unnoticed.
    { name: "default" },
    { name: "with label", props: { label: "Starts at" } },
    { name: "required", props: { label: "Starts at", required: true } },
    { name: "helper text", props: { label: "Starts at", helperText: "Local time" } },
    { name: "error message", props: { label: "Starts at", error: "Required" } },
    { name: "invalid without message", props: { label: "Starts at", error: true } },
    { name: "helper hidden by error", props: { label: "S", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "S" } })),
    { name: "disabled", props: { label: "Starts at", disabled: true } },
    { name: "named", props: { name: "starts", label: "Starts at" } },
    { name: "with a value", props: { defaultValue: "2024-03-15T09:30", label: "Starts at" } },
    { name: "step", props: { step: 900, label: "Starts at" } },
    { name: "bounded", props: { min: "2024-01-01T00:00", max: "2024-12-31T23:59", label: "S" } },
  ],
};

export default spec;
