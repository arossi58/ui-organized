import { Component } from "@angular/core";
import { UioDivider } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDivider],
  // `label` stands for the content; see cases/Divider.tsx.
  template: `
    @if (p['label']) {
      <div
        uioDivider
        labelled
        [spacing]="p['spacing'] ?? 'none'"
        [labelPosition]="p['labelPosition'] ?? 'center'"
      >{{ p['label'] }}</div>
    } @else {
      <div
        uioDivider
        [orientation]="p['orientation'] ?? 'horizontal'"
        [spacing]="p['spacing'] ?? 'none'"
      ></div>
    }
  `,
})
export class DividerFixture {
  protected readonly p = parityProps();
}
