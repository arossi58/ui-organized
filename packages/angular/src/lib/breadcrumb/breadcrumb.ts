import { NgTemplateOutlet } from "@angular/common";
import { Component, TemplateRef, computed, input } from "@angular/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioIcon } from "../icons/icon.js";

/** The icon size every library asks `Icon` for inside a crumb. */
const ICON_SIZE = 16;

export interface BreadcrumbItem {
  /** Visible label for the crumb. */
  label: string;
  /** Link target. Omit on the current (last) crumb. */
  href?: string;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

/**
 * A trail of links showing the current page's location in a hierarchy.
 *
 * ```html
 * <nav uioBreadcrumb [items]="trail"></nav>
 * ```
 *
 * Ark UI has no Breadcrumb primitive, so there is no machine behind this in any
 * of the four libraries and the markup *is* the contract — compared element for
 * element against React by the browser parity gate. It therefore does not extend
 * `UioPart`, for the same reason `UioToolbar` does not: a React breadcrumb
 * carries no `data-scope`/`data-part`, so neither may this one.
 *
 * ── The last crumb is the current page even when it has an href ─────────────
 *
 * The one branch where the two conditions disagree, and the one worth stating:
 * a trailing crumb that carries a link still renders as text, because it is the
 * page the user is already on and nobody would follow it. `aria-current="page"`
 * goes on that crumb alone — a crumb with no href in the *middle* of the trail
 * is neither a link nor the current page, and carries neither.
 */
@Component({
  selector: "nav[uioBreadcrumb]",
  standalone: true,
  imports: [NgTemplateOutlet, UioIcon],
  template: `
    <ol class="breadcrumb__list">
      @for (item of items(); track $index; let index = $index) {
        <li class="breadcrumb__item">
          @if (item.href && !isLast(index)) {
            <a [href]="item.href" class="breadcrumb__link">
              @if (item.icon; as name) {
                <span uioIcon class="breadcrumb__icon" [name]="name" [size]="ICON_SIZE"></span>
              }
              {{ item.label }}
            </a>
          } @else {
            <span
              class="breadcrumb__current"
              [attr.aria-current]="isLast(index) ? 'page' : null"
            >
              @if (item.icon; as name) {
                <span uioIcon class="breadcrumb__icon" [name]="name" [size]="ICON_SIZE"></span>
              }
              {{ item.label }}
            </span>
          }
          @if (!isLast(index)) {
            <span class="breadcrumb__separator" aria-hidden="true">
              @if (separatorTemplate(); as template) {
                <ng-container [ngTemplateOutlet]="template" />
              } @else if (separator() !== undefined) {
                {{ separator() }}
              } @else {
                <span uioIcon name="chevron-right" [size]="ICON_SIZE"></span>
              }
            </span>
          }
        </li>
      }
    </ol>
  `,
  host: {
    class: "breadcrumb text-default-body-medium",
    "aria-label": "Breadcrumb",
  },
})
export class UioBreadcrumb {
  /** The crumb trail, ordered from root to current page. */
  readonly items = input<readonly BreadcrumbItem[]>([]);
  /**
   * Custom separator between crumbs. Defaults to a chevron icon.
   *
   * A string, or a template for anything richer — the same fork `TabItem.content`
   * takes, and the Angular answer to React's `separator?: ReactNode` and Vue's
   * `#separator` slot.
   */
  readonly separator = input<string | TemplateRef<unknown> | undefined>(undefined);

  protected readonly ICON_SIZE = ICON_SIZE;

  protected readonly separatorTemplate = computed(() => {
    const separator = this.separator();
    return separator instanceof TemplateRef ? separator : null;
  });

  protected isLast(index: number): boolean {
    return index === this.items().length - 1;
  }
}
