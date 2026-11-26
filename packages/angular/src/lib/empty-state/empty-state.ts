import { Component, Directive, computed, contentChild, input } from "@angular/core";
import { clsx } from "clsx";
import {
  EMPTY_STATE_ICON_SIZE,
  EMPTY_STATE_TEXT_CLASS,
  emptyStateStyles,
  type EmptyStateVariants,
} from "@ui-organized/core";
import { UioFeaturedIcon } from "../featured-icon/featured-icon.js";
import type { IconName } from "../icons/icon.js";
import type { IconGlyph } from "../icons/glyph.js";

export type EmptyStateSize = NonNullable<EmptyStateVariants["size"]>;

/**
 * The media slot, for an illustration or a FeaturedIcon of the caller's own.
 * The element it sits on *is* the slot, so the DOM matches the other three
 * libraries' `div.empty-state__media` with nothing extra around it.
 */
@Directive({
  selector: "[uioEmptyStateMedia]",
  standalone: true,
  host: { class: "empty-state__media" },
})
export class UioEmptyStateMedia {}

/** The actions row. Like the media slot, the element is the row itself. */
@Directive({
  selector: "[uioEmptyStateActions]",
  standalone: true,
  host: { class: "empty-state__actions" },
})
export class UioEmptyStateActions {}

/**
 * What to show when there is nothing to show: an icon or illustration, a title,
 * a line of description and the actions that get the reader out of it.
 *
 * ```html
 * <div uioEmptyState icon="inbox" title="No messages" description="New messages land here.">
 *   <div uioEmptyStateActions><button uioButton>Compose</button></div>
 * </div>
 * ```
 */
@Component({
  selector: "div[uioEmptyState]",
  standalone: true,
  imports: [UioFeaturedIcon],
  template: `
    @if (!media() && icon(); as name) {
      <div class="empty-state__media">
        <span uioFeaturedIcon [icon]="name" variant="neutral" [size]="iconSize()"></span>
      </div>
    }
    <ng-content select="[uioEmptyStateMedia]" />
    <div class="empty-state__body">
      @switch (headingLevel()) {
        @case (1) { <h1 [class]="titleClass()">{{ title() }}</h1> }
        @case (2) { <h2 [class]="titleClass()">{{ title() }}</h2> }
        @case (3) { <h3 [class]="titleClass()">{{ title() }}</h3> }
        @case (4) { <h4 [class]="titleClass()">{{ title() }}</h4> }
        @case (5) { <h5 [class]="titleClass()">{{ title() }}</h5> }
        @case (6) { <h6 [class]="titleClass()">{{ title() }}</h6> }
        @default { <p [class]="titleClass()">{{ title() }}</p> }
      }
      @if (description(); as text) {
        <p [class]="descriptionClass()">{{ text }}</p>
      }
    </div>
    <ng-content select="[uioEmptyStateActions]" />
  `,
  host: { "[class]": "hostClass()" },
})
export class UioEmptyState {
  /** What is missing, in a few words. Bound as an input, so it never becomes a tooltip. */
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  /** An icon for the topic, drawn as a neutral subtle FeaturedIcon. A projected media slot overrides it. */
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);
  readonly size = input<EmptyStateSize>("md");
  /** Render the title as a heading at this level. Without it the title is a paragraph. */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | undefined>(undefined);

  protected readonly media = contentChild(UioEmptyStateMedia);
  protected readonly iconSize = computed(() => EMPTY_STATE_ICON_SIZE[this.size()]);
  protected readonly hostClass = computed(() => emptyStateStyles({ size: this.size() }));
  protected readonly titleClass = computed(() =>
    clsx("empty-state__title", EMPTY_STATE_TEXT_CLASS[this.size()].title),
  );
  protected readonly descriptionClass = computed(() =>
    clsx("empty-state__description", EMPTY_STATE_TEXT_CLASS[this.size()].description),
  );
}
