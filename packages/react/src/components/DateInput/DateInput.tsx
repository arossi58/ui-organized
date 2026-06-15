import { DateFieldBase } from "../DateField/DateFieldBase.js";
import type { DateInputProps } from "./DateInput.types.js";

/**
 * A single-line date field — native `<input type="date">` on the Input field
 * surface, with a leading calendar button that opens the browser's date picker.
 *
 * Accepts the native `value` / `defaultValue` / `onChange` and `min` / `max`
 * props (ISO `YYYY-MM-DD` strings) alongside the shared `label`, `helperText`,
 * `error`, `size`, and `required` / `disabled` props.
 */
export function DateInput(props: DateInputProps) {
  return <DateFieldBase type="date" pickerLabel="Choose date" {...props} />;
}
