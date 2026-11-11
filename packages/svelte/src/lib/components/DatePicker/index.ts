import Component from "./DatePicker.svelte";
import type { DatePickerProps as Props } from "./DatePicker.types.js";

/** @deprecated Use DateInput for a single date or DateRangeInput for a range. DatePicker is no longer documented and will be removed in the next major release. */
export const DatePicker = Component;
/** @deprecated Use DateInput for a single date or DateRangeInput for a range. DatePicker is no longer documented and will be removed in the next major release. */
export type DatePickerProps = Props;
export type { DatePickerVariants } from "@ui-organized/core";
