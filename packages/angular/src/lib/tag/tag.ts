import { Component, booleanAttribute, computed, input, output } from "@angular/core";
import { UioIcon } from "../icons/icon.js";
import { clsx } from "clsx";
import { resolveTagAppearance, tagStyles, type TagAppearance, type TagVariants } from "@ui-organized/core";
import { glyph } from "../icons/glyph.js";
import type { IconGlyph } from "../icons/glyph.js";
import type { IconName } from "../icons/icon.js";

export type TagVariant = NonNullable<TagVariants["variant"]>;
export type TagSize = NonNullable<TagVariants["size"]>;
export type TagShape = NonNullable<TagVariants["shape"]>;
export type { TagAppearance };

/**
 * A small status label.
 *
 * A component rather than a directive, because the label is wrapped:
 * `.tag__label` is a real element the stylesheet lays out beside the icon, and
 * only a template can put the caller's content inside it.
 *
 * The icon goes either side of the label according to `iconPosition`, which is
 * the other reason the content is projected rather than left where the caller
 * wrote it. It renders at 16px in every tag size, as the other three do.
 */
@Component({
  selector: "span[uioTag]",
  standalone: true,
  imports: [UioIcon],
  template: `
    @if (dot()) {<span class="tag__dot" aria-hidden="true"></span>}@if (icon(); as name) {
      @if (iconPosition() === "left") {
        <span uioIcon class="tag__icon" [name]="name" [size]="ICON_SIZE"></span>
      }
    }<span class="tag__label"><ng-content /></span>@if (icon(); as name) {
      @if (iconPosition() === "right") {
        <span uioIcon class="tag__icon" [name]="name" [size]="ICON_SIZE"></span>
      }
    }@if (removable()) {
      <button type="button" class="tag__remove" [attr.aria-label]="removeLabel() ?? null" (click)="remove.emit($event)">
        <span uioIcon [name]="CLOSE" [size]="REMOVE_ICON_SIZE"></span>
      </button>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioTag {
  readonly variant = input<TagVariant>("success");
  readonly size = input<TagSize>("md");
  /** `solid` (the default), `subtle` or `outline`. */
  readonly appearance = input<TagAppearance | undefined>(undefined);
  /**
   * @deprecated Use `appearance`. `true` is solid and `false` subtle;
   * `appearance` wins when both are given.
   */
  readonly emphasized = input(true);
  readonly shape = input<TagShape>("square");
  /** A leading dot in the label's colour. */
  readonly dot = input(false, { transform: booleanAttribute });
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);
  readonly iconPosition = input<"left" | "right">("left");
  /** Renders the remove button. `removeLabel` is its whole accessible name. */
  readonly removable = input(false, { transform: booleanAttribute });
  readonly removeLabel = input<string | undefined>(undefined);
  readonly remove = output<MouseEvent>();

  /** Icons render at 16px across every tag size. */
  protected readonly ICON_SIZE = 16;
  /** The remove glyph is smaller than a content icon, so it reads as a control. */
  protected readonly REMOVE_ICON_SIZE = 12;
  protected readonly CLOSE = glyph("close");

  protected readonly hostClass = computed(() =>
    clsx(
      tagStyles({
        variant: this.variant(),
        size: this.size(),
        appearance: resolveTagAppearance(this.appearance(), this.emphasized()),
        shape: this.shape(),
      }),
    ),
  );
}
