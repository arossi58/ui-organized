import { DateFieldBase } from "../DateField/DateFieldBase.js";
import type { DateTimeInputProps } from "./DateTimeInput.types.js";

/**
 * A single-line date-and-time field — native `<input type="datetime-local">` on
 * the Input field surface, with a leading calendar button that opens the
 * browser's date/time picker.
 *
 * Accepts the native `value` / `defaultValue` / `onChange`, `min` / `max`, and
 * `step` props (ISO `YYYY-MM-DDTHH:mm` strings) alongside the shared `label`,
 * `helperText`, `error`, `size`, and `required` / `disabled` props.
 */
export function DateTimeInput(props: DateTimeInputProps) {
  return <DateFieldBase type="datetime-local" pickerLabel="Choose date and time" {...props} />;
}
