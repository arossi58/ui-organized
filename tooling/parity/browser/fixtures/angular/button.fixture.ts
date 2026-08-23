import { Component } from "@angular/core";
import { UioButton } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioButton],
  template: `
    <button
      uioButton
      [intent]="p['intent'] ?? 'primary'"
      [size]="p['size'] ?? 'md'"
      [type]="p['type'] ?? 'button'"
      [disabled]="!!p['disabled']"
      [icon]="p['icon']"
      [iconPosition]="p['iconPosition'] ?? 'left'"
      [class]="p['class'] ?? ''"
      [attr.aria-label]="p['aria-label'] ?? null"
    >@if (!p['iconOnly']) {Label}</button>
  `,
})
export class ButtonFixture {
  protected readonly p = parityProps();
}
