import { Component } from "@angular/core";
import { UioImageCropper } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `zoom` and `defaultZoom` are one input: a `model()` is uncontrolled until
 * something binds it, so the controlled/uncontrolled fork React implements by
 * hand does not arise.
 *
 * `initialCrop` and `aspectRatio` are passed through `undefined` and all — both
 * mean "let the machine decide", and defaulting either here would replace a
 * derivation with a decision the scenario never made.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioImageCropper],
  template: `
    <div
      uioImageCropper
      [src]="p['src'] ?? ''"
      [alt]="p['alt'] ?? ''"
      [label]="p['label']"
      [helperText]="p['helperText']"
      [initialCrop]="p['initialCrop']"
      [aspectRatio]="p['aspectRatio']"
      [cropShape]="p['cropShape'] ?? 'rectangle'"
      [zoom]="p['zoom'] ?? p['defaultZoom'] ?? 1"
      [minZoom]="p['minZoom']"
      [maxZoom]="p['maxZoom']"
      [showGrid]="p['showGrid'] ?? true"
      [fixedCropArea]="!!p['fixedCropArea']"
      [size]="p['size'] ?? 'md'"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class ImageCropperFixture {
  protected readonly p = parityProps();
}
