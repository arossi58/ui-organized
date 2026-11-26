import { Component } from "@angular/core";
import { UioButton, UioEmptyState, UioEmptyStateActions } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioButton, UioEmptyState, UioEmptyStateActions],
  template: `
    <div
      uioEmptyState
      [title]="p['title']"
      [description]="p['description']"
      [icon]="p['icon']"
      [size]="p['size'] ?? 'md'"
      [headingLevel]="p['headingLevel']"
      [class]="p['class'] ?? ''"
    >
      @if (p['withActions']) {
        <div uioEmptyStateActions><button uioButton>Clear filters</button></div>
      }
    </div>
  `,
})
export class EmptyStateFixture {
  protected readonly p = parityProps();
}
