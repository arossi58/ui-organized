import { Component } from "@angular/core";
import { UioButton } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Two hosts, because the caller picks the element: `href` scenarios write the
 * anchor a consumer writes, and every other scenario writes a `<button>`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioButton],
  template: `
    @if (p['href'] !== undefined) {
      <a
        uioButton
        [intent]="p['intent'] ?? 'primary'"
        [size]="p['size'] ?? 'md'"
        [loading]="!!p['loading']"
        [icon]="p['icon']"
        [iconPosition]="p['iconPosition'] ?? 'left'"
        [attr.href]="p['href']"
        [attr.target]="p['target'] ?? null"
        [attr.rel]="p['rel'] ?? null"
        [class]="p['class'] ?? ''"
      >@if (!p['iconOnly']) {Label}</a>
    } @else {
      <button
        uioButton
        [intent]="p['intent'] ?? 'primary'"
        [size]="p['size'] ?? 'md'"
        [type]="p['type'] ?? 'button'"
        [disabled]="!!p['disabled']"
        [loading]="!!p['loading']"
        [icon]="p['icon']"
        [iconPosition]="p['iconPosition'] ?? 'left'"
        [class]="p['class'] ?? ''"
        [attr.aria-label]="p['aria-label'] ?? null"
      >@if (!p['iconOnly']) {Label}</button>
    }
  `,
})
export class ButtonFixture {
  protected readonly p = parityProps();
}
