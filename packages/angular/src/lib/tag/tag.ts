import { Component, computed, input } from "@angular/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioIcon } from "../icons/icon.js";
import { clsx } from "clsx";
import { tagStyles, type TagVariants } from "@ui-organized/core";

export type TagVariant = NonNullable<TagVariants["variant"]>;
export type TagSize = NonNullable<TagVariants["size"]>;

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
    @if (icon(); as name) {
      @if (iconPosition() === "left") {
        <span uioIcon class="tag__icon" [name]="name" [size]="ICON_SIZE"></span>
      }
    }<span class="tag__label"><ng-content /></span>@if (icon(); as name) {
      @if (iconPosition() === "right") {
        <span uioIcon class="tag__icon" [name]="name" [size]="ICON_SIZE"></span>
      }
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioTag {
  readonly variant = input<TagVariant>("success");
  readonly size = input<TagSize>("md");
  /** Subdued tags drop the filled treatment; the default is the filled one. */
  readonly emphasized = input(true);
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  readonly iconPosition = input<"left" | "right">("left");

  /** Icons render at 16px across every tag size. */
  protected readonly ICON_SIZE = 16;

  protected readonly hostClass = computed(() =>
    clsx(
      tagStyles({ variant: this.variant(), size: this.size() }),
      !this.emphasized() && "tag--subdued",
    ),
  );
}
