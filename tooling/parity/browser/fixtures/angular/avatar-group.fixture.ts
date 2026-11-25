import { Component } from "@angular/core";
import { UioAvatarGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAvatarGroup],
  template: `
    <div
      uioAvatarGroup
      [items]="p['items']"
      [max]="p['max']"
      [size]="p['size'] ?? 'md'"
      [shape]="p['shape']"
      [label]="p['label']"
    ></div>
  `,
})
export class AvatarGroupFixture {
  protected readonly p = parityProps();
}
