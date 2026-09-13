import { Component } from "@angular/core";
import {
  UioField,
  UioFieldControl,
  UioFieldDescription,
  UioFieldError,
  UioFieldLabel,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same four parts the React, Svelte and Vue fixtures compose, in the same
 * order, so what is compared is the wiring rather than the arrangement.
 *
 * The error is rendered unconditionally where the other three wrap it in a
 * conditional. That is not a difference in output — it removes its own host
 * element when there is nothing to show — but it *is* the invariant the field's
 * `aria-describedby` depends on: a part registers itself once, when it is
 * constructed, so one created later by a surrounding block would register after
 * the control had already described itself. See UioFieldContext.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioField, UioFieldLabel, UioFieldControl, UioFieldDescription, UioFieldError],
  template: `
    <div
      uioField
      [layout]="p['layout'] ?? 'stacked'"
      [invalid]="!!p['invalid']"
      [disabled]="!!p['disabled']"
      [required]="!!p['required']"
      [readOnly]="!!p['readOnly']"
    >
      <label uioFieldLabel>Email</label>
      <input uioFieldControl />
      <span uioFieldDescription>Helper</span>
      <span uioFieldError [message]="p['errorMessage']"></span>
    </div>
  `,
})
export class FieldFixture {
  protected readonly p = parityProps();
}
