import { Component } from "@angular/core";
import { UioFeaturedIcon } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioFeaturedIcon],
  template: `
    <span
      uioFeaturedIcon
      [icon]="p['icon'] ?? 'check'"
      [variant]="p['variant'] ?? 'brand'"
      [appearance]="p['appearance'] ?? 'subtle'"
      [shape]="p['shape'] ?? 'circle'"
      [size]="p['size'] ?? 'md'"
      [label]="p['label']"
      [class]="p['class'] ?? ''"
    ></span>
  `,
})
export class FeaturedIconFixture {
  protected readonly p = parityProps();
}
