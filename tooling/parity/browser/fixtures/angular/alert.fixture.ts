import { Component } from "@angular/core";
import { UioAlert } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAlert],
  template: `
    <div
      uioAlert
      [variant]="p['variant'] ?? 'info'"
      [title]="p['title']"
      [dismissible]="!!p['onDismiss']"
    >{{ p['children'] ?? 'Something happened' }}</div>
  `,
})
export class AlertFixture {
  protected readonly p = parityProps();
}
