import { Component, computed, input } from "@angular/core";
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
 * `icon` is not implemented yet — it waits on `Icon`, and no parity case
 * exercises it. When it lands it goes either side of the label according to
 * `iconPosition`, which is the reason the content is projected rather than left
 * where the caller wrote it.
 */
@Component({
  selector: "span[uioTag]",
  standalone: true,
  template: `<span class="tag__label"><ng-content /></span>`,
  host: { "[class]": "hostClass()" },
})
export class UioTag {
  readonly variant = input<TagVariant>("success");
  readonly size = input<TagSize>("md");
  /** Subdued tags drop the filled treatment; the default is the filled one. */
  readonly emphasized = input(true);

  protected readonly hostClass = computed(() =>
    clsx(
      tagStyles({ variant: this.variant(), size: this.size() }),
      !this.emphasized() && "tag--subdued",
    ),
  );
}
