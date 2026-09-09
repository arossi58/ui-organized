import type { ComponentType } from "react";
import { DatePicker as RDatePicker } from "@ui-organized/react";
import DatePickerFixture from "../fixtures/DatePickerFixture.svelte";
import VueDatePickerFixture from "../fixtures/vue/DatePickerFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "DatePicker",
  react: (p) => <RDatePicker {...p} />,
  svelte: DatePickerFixture as unknown as ComponentType<any>,
  vue: VueDatePickerFixture as unknown as ComponentType<any>,
  // The calendar surface is portalled; see `ParitySpec.select`. What is left is
  // the control — label, the segmented inputs and the trigger — which is where
  // the machine's ARIA and `data-state` live.
  exclude: '[data-scope="date-picker"][data-part="positioner"]',
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Date" } },
    { name: "required", props: { label: "Date", required: true } },
    { name: "helper text", props: { label: "Date", helperText: "Any weekday" } },
    { name: "error message", props: { label: "Date", error: "Required" } },
    { name: "invalid without message", props: { label: "Date", error: true } },
    { name: "helper hidden by error", props: { label: "D", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "D" } })),
    ...(["default", "ghost"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant, label: "D" },
    })),
    { name: "disabled", props: { label: "Date", disabled: true } },
    { name: "read only", props: { label: "Date", readOnly: true } },
    { name: "named", props: { name: "date", label: "Date" } },
    // Range mode renders a second input; single mode must not.
    { name: "range", props: { selectionMode: "range", label: "Stay" } },
    { name: "multiple", props: { selectionMode: "multiple", label: "Dates" } },
    { name: "with a value", props: { defaultValue: ["2024-03-15"], label: "Date" } },
    { name: "bounded", props: { min: "2024-01-01", max: "2024-12-31", label: "D" } },
    { name: "locale", props: { locale: "de-DE", label: "D" } },
    { name: "two months", props: { numOfMonths: 2, label: "D" } },
    // Open state reaches the control and the trigger through `data-state`, and
    // it is the one machine state a static render can still see.
    { name: "open", props: { defaultOpen: true, label: "Date" } },
  ],
};

export default spec;
