import { Component, ElementRef, computed, inject, input } from "@angular/core";
import { clsx } from "clsx";
import {
  TAG_GROUP_ICON_SIZE,
  TAG_GROUP_TAG_SIZE,
  TAG_GROUP_TEXT_CLASS,
  tagGroupStyles,
  type TagGroupVariants,
} from "@ui-organized/core";
import { UioIcon, type IconName } from "../icons/icon.js";
import { glyph, type IconGlyph } from "../icons/glyph.js";
import { UioTag } from "../tag/tag.js";

export type TagGroupVariant = NonNullable<TagGroupVariants["variant"]>;
export type TagGroupSize = NonNullable<TagGroupVariants["size"]>;
export type TagGroupTagPosition = NonNullable<TagGroupVariants["tagPosition"]>;

/**
 * The announcement pill: a short tag and a message in one pill, "New ▸ We've
 * shipped dark mode". The projected content is the message.
 *
 * An attribute on the caller's own `<a>` or `<span>`, as Button is, so a link is
 * written as one and keeps its own `href`:
 *
 * ```html
 * <a uioTagGroup tag="New" href="/changelog">We've shipped dark mode</a>
 * ```
 */
@Component({
  selector: "a[uioTagGroup], span[uioTagGroup]",
  standalone: true,
  imports: [UioIcon, UioTag],
  template: `
    @if (tagPosition() === "leading") {
      <span uioTag class="tag-group__tag" [variant]="variant()" [size]="tagSize()" shape="pill">{{ tag() }}</span>
    }<span [class]="messageClass()"><ng-content /></span>@if (tagPosition() === "trailing") {
      <span uioTag class="tag-group__tag" [variant]="variant()" [size]="tagSize()" shape="pill">{{ tag() }}</span>
    }@if (trailingIcon(); as name) {
      <span uioIcon class="tag-group__icon" [name]="name" [size]="iconSize()"></span>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioTagGroup {
  /** The short label in the inner pill: "New", "Beta", "v6.2". */
  readonly tag = input.required<string>();
  readonly variant = input<TagGroupVariant>("brand");
  readonly size = input<TagGroupSize>("md");
  readonly tagPosition = input<TagGroupTagPosition>("leading");
  /** A trailing icon. Defaults to a chevron on an `<a>`, and none on a `<span>`. */
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);

  private readonly isAnchor = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === "A";

  protected readonly tagSize = computed(() => TAG_GROUP_TAG_SIZE[this.size()]);
  protected readonly iconSize = computed(() => TAG_GROUP_ICON_SIZE[this.size()]);
  protected readonly trailingIcon = computed(() => this.icon() ?? (this.isAnchor ? glyph("chevron-right") : undefined));
  protected readonly messageClass = computed(() => clsx("tag-group__message", TAG_GROUP_TEXT_CLASS[this.size()]));
  protected readonly hostClass = computed(() =>
    tagGroupStyles({ variant: this.variant(), size: this.size(), tagPosition: this.tagPosition() }),
  );
}
