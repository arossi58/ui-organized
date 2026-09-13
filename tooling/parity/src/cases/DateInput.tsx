import type { ComponentType } from "react";
import { DateInput as RDateInput } from "@ui-organized/react";
import DateInputFixture from "../fixtures/DateInputFixture.svelte";
import VueDateInputFixture from "../fixtures/vue/DateInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "DateInput",
  react: (p) => <RDateInput {...p} />,
  svelte: DateInputFixture as unknown as ComponentType<any>,
  vue: VueDateInputFixture as unknown as ComponentType<any>,
  /**
   * Everything except the calendar popup: the field, its label, the leading
   * picker trigger and the native control are all rendered in place, and the
   * trigger is where `aria-expanded`, `data-state` and the dropped
   * `aria-controls` live.
   *
   * The popup is portalled, so a static render says nothing true about it — see
   * `ParitySpec.select`. It also holds the internal Calendar, which has no
   * contract of its own to compare.
   */
  exclude: '[data-scope="popover"][data-part="positioner"]',
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Start date" } },
    { name: "required", props: { label: "Start date", required: true } },
    { name: "helper text", props: { label: "Start date", helperText: "Any weekday" } },
    // The error path replaces the helper text and drives [data-invalid] through
    // every part of the field.
    { name: "error message", props: { label: "Start date", error: "Required" } },
    { name: "invalid without message", props: { label: "Start date", error: true } },
    { name: "helper hidden by error", props: { label: "S", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "S" } })),
    { name: "disabled", props: { label: "Start date", disabled: true } },
    { name: "named", props: { name: "start", label: "Start date" } },
    // A native date input is never `:placeholder-shown`, so the empty state is
    // flagged with `data-empty` instead — which means the *filled* state is the
    // one that has to drop the attribute again.
    { name: "with a value", props: { defaultValue: "2024-03-15", label: "Start date" } },
    { name: "bounded", props: { min: "2024-01-01", max: "2024-12-31", label: "S" } },
  ],
};

export default spec;
