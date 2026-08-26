import { Component } from "@angular/core";
import { UioPagination } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * React takes an `onPageChange` callback; Angular's `page` is a `model()`. The
 * scenario binds neither — nothing about the callback reaches the DOM — so the
 * fixture passes `page` one-way and lets the component own it from there, which
 * is exactly how an uncontrolled React `Pagination` behaves once clicked.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioPagination],
  template: `
    <nav
      uioPagination
      [page]="p['page'] ?? 1"
      [count]="p['count'] ?? 1"
      [siblingCount]="p['siblingCount'] ?? 1"
      [boundaryCount]="p['boundaryCount'] ?? 1"
      [showPrevNext]="p['showPrevNext'] ?? true"
    ></nav>
  `,
})
export class PaginationFixture {
  protected readonly p = parityProps();
}
