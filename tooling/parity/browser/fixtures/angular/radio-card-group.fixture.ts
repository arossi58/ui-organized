import { Component } from "@angular/core";
import { UioRadioCardGroup, type SelectionCardOption } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioRadioCardGroup],
  template: `
    <div
      uioRadioCardGroup
      [options]="options"
      [value]="p['defaultValue'] ?? p['value']"
      [label]="p['label']"
      [columns]="p['columns'] ?? 1"
      [size]="p['size'] ?? 'md'"
      [indicator]="p['indicator'] ?? 'end'"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
      [error]="p['error']"
      [aria-label]="p['aria-label']"
    ></div>
  `,
})
export class RadioCardGroupFixture {
  protected readonly p = parityProps();
  protected readonly options = (this.p["options"] ?? []) as SelectionCardOption[];
}
