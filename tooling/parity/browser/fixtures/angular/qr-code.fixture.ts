import { Component } from "@angular/core";
import { UioQrCode } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The overlay arrives as a boolean, because a node, a snippet, a slot and a
 * `TemplateRef` cannot be written into one props object. Each library turns the
 * flag into its own equivalent of the same span; this is Angular's.
 *
 * The `<ng-template>` itself renders only a comment anchor, which the contract
 * strips along with every other renderer's bookkeeping.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioQrCode],
  template: `
    <ng-template #logo><span class="qr-overlay-probe">logo</span></ng-template>
    <div
      uioQrCode
      [value]="p['value'] ?? ''"
      [label]="p['label']"
      [pixelSize]="p['pixelSize'] ?? 10"
      [errorCorrection]="p['errorCorrection']"
      [overlay]="p['overlay'] ? logo : undefined"
      [showDownload]="!!p['showDownload']"
      [downloadLabel]="p['downloadLabel'] ?? 'Download'"
      [downloadFileName]="p['downloadFileName'] ?? 'qr-code'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class QRCodeFixture {
  protected readonly p = parityProps();
}
