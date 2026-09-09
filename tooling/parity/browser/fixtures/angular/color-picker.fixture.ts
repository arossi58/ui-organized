import { Component } from "@angular/core";
import { UioColorPicker } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `value` / `defaultValue` and `open` / `defaultOpen` collapse into one binding
 * each: a `model()` is uncontrolled until something binds it, so the fork React
 * implements by hand does not arise — the arrangement `UioSwitch` describes.
 *
 * `format` is passed through `undefined` and all — the component turns that into
 * `"rgba"` itself, as every other library's parameter default does, so filling it
 * in here would
 * quietly rewrite `hsl(221, 83%, 53%)` as rgb.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioColorPicker],
  template: `
    <div
      uioColorPicker
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [value]="p['value'] ?? p['defaultValue'] ?? '#000000'"
      [format]="p['format']"
      [swatches]="p['swatches'] ?? []"
      [showEyeDropper]="p['showEyeDropper'] ?? true"
      [open]="p['open'] ?? p['defaultOpen'] ?? false"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [readOnly]="!!p['readOnly']"
      [name]="p['name']"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class ColorPickerFixture {
  protected readonly p = parityProps();
}
