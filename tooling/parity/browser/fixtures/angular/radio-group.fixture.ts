import { Component } from "@angular/core";
import { UioRadioGroup, type RadioOption } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioRadioGroup],
  template: `
    <div
      uioRadioGroup
      [options]="options"
      [value]="p['defaultValue'] ?? p['value']"
      [label]="p['label']"
      [orientation]="p['orientation'] ?? 'vertical'"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [aria-label]="p['aria-label']"
    ></div>
  `,
})
export class RadioGroupFixture {
  protected readonly p = parityProps();
  protected readonly options = (this.p["options"] ?? []) as RadioOption[];
}
