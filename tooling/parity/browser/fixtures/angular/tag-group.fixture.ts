import { Component } from "@angular/core";
import { UioTagGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** Two hosts, as Button: an `href` scenario writes the anchor a consumer writes. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTagGroup],
  template: `
    @if (p['href'] !== undefined) {
      <a
        uioTagGroup
        [tag]="p['tag']"
        [variant]="p['variant'] ?? 'brand'"
        [size]="p['size'] ?? 'md'"
        [tagPosition]="p['tagPosition'] ?? 'leading'"
        [icon]="p['icon']"
        [attr.href]="p['href']"
        [class]="p['class'] ?? ''"
      >Message</a>
    } @else {
      <span
        uioTagGroup
        [tag]="p['tag']"
        [variant]="p['variant'] ?? 'brand'"
        [size]="p['size'] ?? 'md'"
        [tagPosition]="p['tagPosition'] ?? 'leading'"
        [icon]="p['icon']"
        [class]="p['class'] ?? ''"
      >Message</span>
    }
  `,
})
export class TagGroupFixture {
  protected readonly p = parityProps();
}
