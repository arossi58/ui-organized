import { Component } from "@angular/core";
import { UioDivider } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDivider],
  template: `
    <div
      uioDivider
      [orientation]="p['orientation'] ?? 'horizontal'"
      [spacing]="p['spacing'] ?? 'none'"
    ></div>
  `,
})
export class DividerFixture {
  protected readonly p = parityProps();
}
