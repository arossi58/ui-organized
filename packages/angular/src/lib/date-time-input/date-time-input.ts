import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UioButton } from "../button/button.js";
import { UioCalendar } from "../calendar/calendar.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";
import { UioIcon } from "../icons/icon.js";
import {
  DATE_FIELD_TEMPLATE,
  UioDateFieldBase,
  type DateFieldSize,
} from "../date-field/date-field-base.js";
import { UioDatePopover, UioDatePopoverTrigger } from "../date-field/date-popover.js";

/** The size variants both single date fields share with `UioInput`. */
export type DateTimeInputSize = DateFieldSize;

/**
 * A single-line date-and-time field — a native `<input type="datetime-local">`
 * on the Input field surface, with a leading calendar button.
 *
 * ```html
 * <div uioDateTimeInput label="Starts at" [(value)]="startsAt"></div>
 * ```
 *
 * The same field as `UioDateInput`, with the one branch that only a datetime
 * has: the popover grows a time field and a Done button under the grid, and
 * choosing a day therefore leaves it *open* so the time can still be set. That
 * is why the Done button exists at all.
 */
@Component({
  selector: "div[uioDateTimeInput]",
  standalone: true,
  exportAs: "uioDateTimeInput",
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioDateTimeInput), multi: true },
  ],
  imports: [
    UioButton,
    UioCalendar,
    UioDatePopover,
    UioDatePopoverTrigger,
    UioFieldError,
    UioFieldLabel,
    UioIcon,
  ],
  template: DATE_FIELD_TEMPLATE,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioDateTimeInput extends UioDateFieldBase {
  protected override readonly type = "datetime-local" as const;
  protected override readonly pickerLabel = "Choose date and time";
}
