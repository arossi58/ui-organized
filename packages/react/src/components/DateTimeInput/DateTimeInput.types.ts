import type { DateFieldProps } from "../DateField/DateFieldBase.types.js";

/** Props for {@link DateTimeInput}. Native datetime-local props (`value`,
 *  `min`, `max`, `step`, `onChange`, …) are inherited; `type` is fixed to
 *  `"datetime-local"`. */
export interface DateTimeInputProps extends DateFieldProps {}
