import { Component } from "@angular/core";
import {
  UioField,
  UioFieldControl,
  UioFieldLabel,
  UioFieldset,
  UioFieldsetLegend,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same grouping the other three fixtures compose.
 *
 * `<fieldset>` and `<legend>` are written out as real elements here where React,
 * Svelte and Vue name components — Angular decorates the native tags rather than
 * replacing them, precisely so `<fieldset disabled>` keeps the browser behaviour
 * that makes the element worth using. The rendered contract is the same.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioFieldset, UioFieldsetLegend, UioField, UioFieldLabel, UioFieldControl],
  template: `
    <fieldset uioFieldset [disabled]="!!p['disabled']" [invalid]="!!p['invalid']">
      <legend uioFieldsetLegend>Contact</legend>
      <div uioField>
        <label uioFieldLabel>Email</label>
        <input uioFieldControl />
      </div>
    </fieldset>
  `,
})
export class FieldsetFixture {
  protected readonly p = parityProps();
}
