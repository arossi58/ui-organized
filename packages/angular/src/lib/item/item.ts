import {
  Component,
  Directive,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { clsx } from "clsx";
import {
  ITEM_ICON_SIZE,
  ITEM_TEXT_CLASS,
  itemGroupStyles,
  itemStyles,
  type ItemSize,
  type ItemVariant,
} from "@ui-organized/core";
import { UioIcon, type IconName } from "../icons/icon.js";
import type { IconGlyph } from "../icons/glyph.js";

export type { ItemSize, ItemVariant };

/**
 * Rows that belong together, as a list: each Item inside is one of its list items.
 *
 * ```html
 * <div uioItemGroup>
 *   <div uioItem title="Weekly digest" description="A summary of your activity."></div>
 * </div>
 * ```
 */
@Component({
  selector: "div[uioItemGroup]",
  standalone: true,
  template: `<ng-content />`,
  host: { role: "list", "[class]": "hostClass()" },
})
export class UioItemGroup {
  /** `plain`, or `outline` to put the whole group in one frame. */
  readonly variant = input<"plain" | "outline">("plain");
  /** A rule between rows. Defaults to true. */
  readonly divided = input(true, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    itemGroupStyles({ variant: this.variant(), divided: this.divided() }),
  );
}

/** The media slot, for an Avatar or an image. The element is the slot itself. */
@Directive({
  selector: "[uioItemMedia]",
  standalone: true,
  host: { class: "item__media" },
})
export class UioItemMedia {}

/** The actions slot. The element is the slot itself, raised above a link row's hit area. */
@Directive({
  selector: "[uioItemActions]",
  standalone: true,
  host: { class: "item__actions" },
})
export class UioItemActions {}

/**
 * A router link as the row's link, such as `<a uioItemLink routerLink="/settings">Settings</a>`.
 * It is projected into the title, and its own content is the title's text.
 */
@Directive({
  selector: "a[uioItemLink]",
  standalone: true,
  host: { class: "item__link" },
})
export class UioItemLink {}

/**
 * A row: media, a title with a line of description, and actions at the end.
 * With `href` or a projected `a[uioItemLink]` the whole row follows the link,
 * and the actions stay their own controls.
 *
 * ```html
 * <div uioItem icon="bell" title="Product updates" href="/settings/updates">
 *   <div uioItemActions><button uioButton>Edit</button></div>
 * </div>
 * ```
 */
@Component({
  selector: "div[uioItem]",
  standalone: true,
  imports: [UioIcon, NgTemplateOutlet],
  template: `
    <ng-template #label>
      <ng-content select="a[uioItemLink]" />
      @if (!link()) {
        @if (href(); as url) {
          <a
            class="item__link"
            [href]="url"
            [attr.target]="target() ?? null"
            [attr.rel]="rel() ?? null"
            >{{ title() }}</a
          >
        } @else {
          {{ title() }}
        }
      }
    </ng-template>
    @if (!media() && icon(); as name) {
      <div class="item__media item__media--icon">
        <span uioIcon [name]="name" [size]="iconSize()"></span>
      </div>
    }
    <ng-content select="[uioItemMedia]" />
    <div class="item__body">
      @switch (headingLevel()) {
        @case (1) {
          <h1 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h1>
        }
        @case (2) {
          <h2 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h2>
        }
        @case (3) {
          <h3 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h3>
        }
        @case (4) {
          <h4 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h4>
        }
        @case (5) {
          <h5 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h5>
        }
        @case (6) {
          <h6 [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </h6>
        }
        @default {
          <p [class]="titleClass()" [attr.id]="titleId() ?? null">
            <ng-container [ngTemplateOutlet]="label" />
          </p>
        }
      }
      @if (description(); as text) {
        <p [class]="descriptionClass()" [attr.id]="descriptionId() ?? null">{{ text }}</p>
      }
    </div>
    <ng-content select="[uioItemActions]" />
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.title]": "null",
    "[attr.role]": "group ? 'listitem' : null",
  },
})
export class UioItem {
  /** What the row is. Bound as an input, so it never becomes a tooltip. A projected link brings its own text instead. */
  readonly title = input<string>("");
  readonly description = input<string | undefined>(undefined);
  /** An icon, drawn in a tile. A projected media slot overrides it. */
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);
  /** Makes the whole row a link to this address. */
  readonly href = input<string | undefined>(undefined);
  readonly target = input<string | undefined>(undefined);
  readonly rel = input<string | undefined>(undefined);
  readonly variant = input<ItemVariant>("plain");
  readonly size = input<ItemSize>("md");
  /** Render the title as a heading at this level. Without it the title is a paragraph. */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | undefined>(undefined);
  /** An id for the title, so a control in the actions can be named by it with `aria-labelledby`. */
  readonly titleId = input<string | undefined>(undefined);
  readonly descriptionId = input<string | undefined>(undefined);

  protected readonly group = inject(UioItemGroup, { optional: true });
  protected readonly media = contentChild(UioItemMedia);
  protected readonly link = contentChild(UioItemLink);
  protected readonly iconSize = computed(() => ITEM_ICON_SIZE[this.size()]);
  protected readonly hostClass = computed(() =>
    itemStyles({
      variant: this.variant(),
      size: this.size(),
      link: this.href() != null || this.link() != null,
    }),
  );
  protected readonly titleClass = computed(() =>
    clsx("item__title", ITEM_TEXT_CLASS[this.size()].title),
  );
  protected readonly descriptionClass = computed(() =>
    clsx("item__description", ITEM_TEXT_CLASS[this.size()].description),
  );
}
