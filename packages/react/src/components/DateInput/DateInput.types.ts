import type { DateFieldProps } from "../DateField/DateFieldBase.types.js";

/** Props for {@link DateInput}. Native date-input props (`value`, `min`, `max`,
 *  `onChange`, …) are inherited; `type` is fixed to `"date"`. */
export interface DateInputProps extends DateFieldProps {}
