import { Component } from "@angular/core";
import { UioTag } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTag],
  template: `
    <span
      uioTag
      [variant]="p['variant'] ?? 'success'"
      [size]="p['size'] ?? 'md'"
      [appearance]="p['appearance']"
      [emphasized]="p['emphasized'] ?? true"
      [shape]="p['shape'] ?? 'square'"
      [dot]="!!p['dot']"
      [icon]="p['icon']"
      [iconPosition]="p['iconPosition'] ?? 'left'"
      [removable]="!!p['removable']"
      [removeLabel]="p['removeLabel']"
    >Label</span>
  `,
})
export class TagFixture {
  protected readonly p = parityProps();
}
