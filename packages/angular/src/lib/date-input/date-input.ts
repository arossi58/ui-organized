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
export type DateInputSize = DateFieldSize;

/**
 * A single-line date field — a native `<input type="date">` on the Input field
 * surface, with a leading calendar button.
 *
 * ```html
 * <div uioDateInput label="Start date" min="2024-01-01" formControlName="start"></div>
 * ```
 *
 * On a fine pointer the button opens the design system's own calendar popover;
 * on a touch device it opens the OS-native picker instead, where the native
 * wheel is the better experience. Either way the input itself stays fully
 * typeable, keeps its `min`/`max`, and is what a form submits.
 *
 * Everything but the native `type` and the button's label is shared with
 * `UioDateTimeInput` — see `UioDateFieldBase`.
 */
@Component({
  selector: "div[uioDateInput]",
  standalone: true,
  exportAs: "uioDateInput",
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioDateInput), multi: true },
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
export class UioDateInput extends UioDateFieldBase {
  protected override readonly type = "date" as const;
  protected override readonly pickerLabel = "Choose date";
}
