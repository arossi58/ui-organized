import { Component } from "@angular/core";
import { UioAvatarLabel } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAvatarLabel],
  template: `
    <div
      uioAvatarLabel
      [name]="p['name']"
      [description]="p['description']"
      [src]="p['src']"
      [fallback]="p['fallback']"
      [size]="p['size'] ?? 'md'"
      [shape]="p['shape']"
      [status]="p['status']"
      [statusLabel]="p['statusLabel']"
      [verified]="!!p['verified']"
      [verifiedLabel]="p['verifiedLabel']"
    ></div>
  `,
})
export class AvatarLabelFixture {
  protected readonly p = parityProps();
}
