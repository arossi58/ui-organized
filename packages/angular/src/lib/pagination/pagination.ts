import { Component, computed, input, model, output } from "@angular/core";
import { getPageItems, withEllipsisPages } from "@ui-organized/core";
import { UioButton } from "../button/button.js";
import { UioMenu, UioMenuItem, UioMenuTrigger } from "../menu/menu.js";

/**
 * The page window, flattened into one uniform shape before it reaches the
 * template.
 *
 * A discriminated union rather than `number | Ellipsis`: `@if` compiles to a
 * real `if` in Angular's type-check block, so a `kind` field narrows the two
 * branches properly under `strictTemplates`, where narrowing an optional
 * property across a template boundary does not reliably survive a compiler
 * release.
 */
type PageEntry =
  | { kind: "page"; key: string; page: number; label: string }
  | { kind: "gap"; key: string; pages: number[]; label: string };

/**
 * Numbered page navigation with previous/next controls, and a jump menu behind
 * each ellipsis.
 *
 * ```html
 * <nav uioPagination [(page)]="page" [count]="20"></nav>
 * ```
 *
 * Ark UI has no Pagination primitive, so the markup is this library's own — and
 * so, like `UioBreadcrumb`, the root carries no `data-scope`/`data-part` and
 * does not extend `UioPart`. The *window* is not ours: which numbers show and
 * where the gaps fall is pure arithmetic in `@ui-organized/core`
 * (`getPageItems` / `withEllipsisPages`), shared with every other ui-organized
 * library precisely so the four cannot drift on the edge cases — a short range
 * with no gaps, a gap exactly one page wide, the window pinned at either end.
 *
 * ── The ellipsis is a control, not decoration ───────────────────────────────
 *
 * Each gap is the only way to reach the pages it hides, so it is a real menu
 * trigger with a `UioMenu` behind it, one per gap. The menu's host element is
 * taken out of the DOM by `HostPresence` the moment it initialises, so the
 * `<li>` ends up holding the trigger alone — which is what React renders, where
 * `<Menu>` is a context provider with no element of its own.
 *
 * Where React takes an `onPageChange` callback, this is a `model()`: `[(page)]`
 * for two-way binding, `(pageChange)` for the one-way notification.
 */
@Component({
  selector: "nav[uioPagination]",
  standalone: true,
  imports: [UioButton, UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    <ul class="pagination__list">
      @if (showPrevNext()) {
        <li>
          <button
            uioButton
            intent="ghost"
            icon="chevron-left"
            aria-label="Previous page"
            [disabled]="page() <= 1"
            (click)="goTo(page() - 1)"
          ></button>
        </li>
      }
      @for (entry of entries(); track entry.key) {
        <li>
          @if (entry.kind === "page") {
            <button
              type="button"
              class="pagination__page text-default-body-medium"
              [attr.aria-current]="entry.page === page() ? 'page' : null"
              [attr.aria-label]="entry.label"
              (click)="goTo(entry.page)"
            >{{ entry.page }}</button>
          } @else {
            <button
              uioMenuTrigger
              type="button"
              class="pagination__ellipsis"
              [menu]="jump"
              [attr.aria-label]="entry.label"
            >
              <span aria-hidden="true">…</span>
            </button>
            <uio-menu
              #jump="uioMenu"
              contentClass="pagination__ellipsis-menu"
              (select)="goTo(+$event)"
            >
              @for (hidden of entry.pages; track hidden) {
                <div uioMenuItem [value]="pageValue(hidden)">{{ hidden }}</div>
              }
            </uio-menu>
          }
        </li>
      }
      @if (showPrevNext()) {
        <li>
          <button
            uioButton
            intent="ghost"
            icon="chevron-right"
            aria-label="Next page"
            [disabled]="page() >= count()"
            (click)="goTo(page() + 1)"
          ></button>
        </li>
      }
    </ul>
  `,
  host: {
    class: "pagination",
    "aria-label": "Pagination",
  },
})
export class UioPagination {
  /** The current page (1-based). Uncontrolled until something binds it. */
  readonly page = model(1);
  /** Total number of pages. Defaulted rather than required — see `UioMeter.value`. */
  readonly count = input(1);
  /** Pages shown on each side of the current page. */
  readonly siblingCount = input(1);
  /** Pages always shown at the start and end. */
  readonly boundaryCount = input(1);
  /** Render the previous/next arrow controls. */
  readonly showPrevNext = input(true);
  readonly pageChange = output<number>();

  protected readonly entries = computed<PageEntry[]>(() =>
    withEllipsisPages(
      getPageItems(this.page(), this.count(), this.siblingCount(), this.boundaryCount()),
    ).map((item, index) => {
      if (typeof item === "number") {
        return {
          kind: "page",
          key: `page-${item}`,
          page: item,
          label: `Go to page ${item}`,
        };
      }
      const first = item.pages[0];
      const last = item.pages[item.pages.length - 1];
      return {
        kind: "gap",
        key: `ellipsis-${index}`,
        pages: item.pages,
        label: `Jump to a page between ${first} and ${last}`,
      };
    }),
  );

  /** A menu item's value is a string; the page it names is a number. */
  protected pageValue(page: number): string {
    return String(page);
  }

  protected goTo(page: number): void {
    this.page.set(page);
    this.pageChange.emit(page);
  }
}
