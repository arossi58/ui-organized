import { Component } from "@angular/core";
import { UioBreadcrumb, type BreadcrumbItem } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * React's `separator` is a `ReactNode` and Angular's is `string | TemplateRef`.
 * Every case passes a string, which both accept — the template half has no
 * counterpart in the other three libraries and so nothing to be compared against.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioBreadcrumb],
  template: `
    <nav uioBreadcrumb [items]="items" [separator]="p['separator']"></nav>
  `,
})
export class BreadcrumbFixture {
  protected readonly p = parityProps();
  protected readonly items = (this.p["items"] ?? []) as BreadcrumbItem[];
}
