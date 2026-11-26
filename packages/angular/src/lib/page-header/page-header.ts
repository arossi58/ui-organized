import {
  Component,
  Directive,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from "@angular/core";
import { clsx } from "clsx";
import {
  PAGE_HEADER_TEXT_CLASS,
  SECTION_FOOTER_TEXT_CLASS,
  SECTION_HEADER_TEXT_CLASS,
  pageHeaderStyles,
  sectionFooterStyles,
  sectionHeaderStyles,
  type PageHeaderSize,
  type SectionHeaderSize,
} from "@ui-organized/core";

export type { PageHeaderSize, SectionHeaderSize };
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The breadcrumb trail above a PageHeader's title. The element is the slot itself. */
@Directive({
  selector: "[uioPageHeaderBreadcrumbs]",
  standalone: true,
  host: { class: "page-header__breadcrumbs" },
})
export class UioPageHeaderBreadcrumbs {}

/** A PageHeader's actions, beside the title. */
@Directive({
  selector: "[uioPageHeaderActions]",
  standalone: true,
  host: { class: "page-header__actions" },
})
export class UioPageHeaderActions {}

/** The row of tabs under a PageHeader's title, whose panels hold the page body. */
@Directive({
  selector: "[uioPageHeaderTabs]",
  standalone: true,
  host: { class: "page-header__tabs" },
})
export class UioPageHeaderTabs {}

/**
 * The top of a page: a breadcrumb trail, the title and description, the
 * page's actions, and an optional row of tabs.
 *
 * ```html
 * <div uioPageHeader title="Billing" description="Plans, invoices and payment methods.">
 *   <div uioPageHeaderActions><button uioButton>Upgrade</button></div>
 * </div>
 * ```
 *
 * A plain block rather than `<header>`, which outside `<main>` is a second
 * banner landmark. `title` is an input, and the host never keeps it as a
 * tooltip.
 */
@Component({
  selector: "div[uioPageHeader]",
  standalone: true,
  template: `
    <ng-content select="[uioPageHeaderBreadcrumbs]" />
    <div class="page-header__row">
      <div class="page-header__heading">
        @switch (headingLevel()) {
          @case (2) {
            <h2 [class]="titleClass()">{{ title() }}</h2>
          }
          @case (3) {
            <h3 [class]="titleClass()">{{ title() }}</h3>
          }
          @case (4) {
            <h4 [class]="titleClass()">{{ title() }}</h4>
          }
          @case (5) {
            <h5 [class]="titleClass()">{{ title() }}</h5>
          }
          @case (6) {
            <h6 [class]="titleClass()">{{ title() }}</h6>
          }
          @default {
            <h1 [class]="titleClass()">{{ title() }}</h1>
          }
        }
        @if (description(); as text) {
          <p [class]="descriptionClass()">{{ text }}</p>
        }
      </div>
      <ng-content select="[uioPageHeaderActions]" />
    </div>
    <ng-content select="[uioPageHeaderTabs]" />
  `,
  host: { "[class]": "hostClass()", "[attr.title]": "null" },
})
export class UioPageHeader {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly size = input<PageHeaderSize>("md");
  /** The title's heading level. Defaults to 1. */
  readonly headingLevel = input<HeadingLevel>(1);
  /** A rule under the header. Ignored with a tabs slot. */
  readonly divided = input(false, { transform: booleanAttribute });

  protected readonly tabs = contentChild(UioPageHeaderTabs);
  protected readonly hostClass = computed(() =>
    pageHeaderStyles({ size: this.size(), divided: this.divided(), tabs: !!this.tabs() }),
  );
  protected readonly titleClass = computed(() =>
    clsx("page-header__title", PAGE_HEADER_TEXT_CLASS[this.size()].title),
  );
  protected readonly descriptionClass = computed(() =>
    clsx("page-header__description", PAGE_HEADER_TEXT_CLASS[this.size()].description),
  );
}

/** A SectionHeader's actions, beside the title. */
@Directive({
  selector: "[uioSectionHeaderActions]",
  standalone: true,
  host: { class: "section-header__actions" },
})
export class UioSectionHeaderActions {}

/** A section's title row, one level down from PageHeader. */
@Component({
  selector: "div[uioSectionHeader]",
  standalone: true,
  template: `
    <div class="section-header__heading">
      @switch (headingLevel()) {
        @case (1) {
          <h1 [class]="titleClass()">{{ title() }}</h1>
        }
        @case (3) {
          <h3 [class]="titleClass()">{{ title() }}</h3>
        }
        @case (4) {
          <h4 [class]="titleClass()">{{ title() }}</h4>
        }
        @case (5) {
          <h5 [class]="titleClass()">{{ title() }}</h5>
        }
        @case (6) {
          <h6 [class]="titleClass()">{{ title() }}</h6>
        }
        @default {
          <h2 [class]="titleClass()">{{ title() }}</h2>
        }
      }
      @if (description(); as text) {
        <p [class]="descriptionClass()">{{ text }}</p>
      }
    </div>
    <ng-content select="[uioSectionHeaderActions]" />
  `,
  host: { "[class]": "hostClass()", "[attr.title]": "null" },
})
export class UioSectionHeader {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly size = input<SectionHeaderSize>("md");
  readonly align = input<"start" | "center">("start");
  /** The title's heading level. Defaults to 2. */
  readonly headingLevel = input<HeadingLevel>(2);
  readonly divided = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    sectionHeaderStyles({ size: this.size(), align: this.align(), divided: this.divided() }),
  );
  protected readonly titleClass = computed(() =>
    clsx("section-header__title", SECTION_HEADER_TEXT_CLASS[this.size()].title),
  );
  protected readonly descriptionClass = computed(() =>
    clsx("section-header__description", SECTION_HEADER_TEXT_CLASS[this.size()].description),
  );
}

/** A SectionFooter's status line, at the start. */
@Directive({
  selector: "[uioSectionFooterContent]",
  standalone: true,
  host: { class: `section-footer__content ${SECTION_FOOTER_TEXT_CLASS}` },
})
export class UioSectionFooterContent {}

/** A SectionFooter's closing actions, at the end. */
@Directive({
  selector: "[uioSectionFooterActions]",
  standalone: true,
  host: { class: "section-footer__actions" },
})
export class UioSectionFooterActions {}

/** The row that closes a section: a status line at the start, its actions at the end. */
@Component({
  selector: "div[uioSectionFooter]",
  standalone: true,
  template: `
    <ng-content select="[uioSectionFooterContent]" />
    <ng-content select="[uioSectionFooterActions]" />
  `,
  host: { "[class]": "hostClass()" },
})
export class UioSectionFooter {
  readonly divided = input(false, { transform: booleanAttribute });
  protected readonly hostClass = computed(() => sectionFooterStyles({ divided: this.divided() }));
}
