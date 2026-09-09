import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioIcon } from "../icons/icon.js";
import { clsx } from "clsx";
import {
  COMPARISON_ICONS,
  chipStyles,
  type ChipVariants,
  type ComparisonIconName,
} from "@ui-organized/core";

export type ChipVariant = NonNullable<ChipVariants["variant"]>;
export type ChipSize = NonNullable<ChipVariants["size"]>;

/**
 * A compact token standing for something the user added — a filter, a facet, a
 * recipient — which they can then edit or remove.
 *
 * A component rather than a directive for the same reason `UioTag` is one: the
 * parts are real elements the stylesheet lays out, and only a template can put
 * them there. Here it matters more, because the chip is often **two controls** —
 * a body that opens something and a dismiss that removes it — and they have to
 * be siblings. A dismiss button inside the body would be a button inside a
 * button: invalid HTML, and an axe `nested-interactive` violation.
 */
@Component({
  selector: "span[uioChip]",
  standalone: true,
  imports: [UioIcon, NgTemplateOutlet],
  template: `
    @if (interactive()) {
      <button
        type="button"
        class="chip__body"
        [disabled]="disabled()"
        (click)="activate.emit($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </button>
    } @else {
      <span class="chip__body"><ng-container [ngTemplateOutlet]="body" /></span>
    }

    @if (removable()) {
      <button
        type="button"
        class="chip__remove"
        [attr.aria-label]="removeLabel()"
        [disabled]="disabled()"
        (click)="remove.emit($event)"
      >
        <span uioIcon name="close" [size]="ICON_SIZE"></span>
      </button>
    }

    <ng-template #body>
      @if (icon(); as name) {
        <span uioIcon class="chip__icon" [name]="name" [size]="ICON_SIZE"></span>
      }
      @if (label(); as text) {
        <span class="chip__label">{{ text }}</span>
      }
      <!-- Drawn or spelled, never both. UioIcon already takes raw markup:
           Angular's sanitizer strips SVG out of innerHTML, so it parses the
           string into a real node instead. -->
      @if (operatorMarkup(); as markup) {
        <span
          uioIcon
          class="chip__operator"
          [svg]="markup"
          [size]="COMPARISON_ICON_SIZE"
          [label]="operatorLabel()"
        ></span>
      } @else if (detail(); as text) {
        <span class="chip__detail">{{ text }}</span>
      }
      <span class="chip__value"><ng-content /></span>
      @if (dropdown()) {
        <span uioIcon class="chip__caret" name="chevron-down" [size]="ICON_SIZE"></span>
      }
    </ng-template>
  `,
  host: { "[class]": "hostClass()" },
})
export class UioChip {
  readonly variant = input<ChipVariant>("outline");
  readonly size = input<ChipSize>("md");
  /** The emphasized half — what the chip is *about*. Never truncated. */
  readonly label = input<string | undefined>(undefined);
  /** The quiet middle: "is any of", "before", "greater than". Ignored when
   *  `operator` is set — the relation is either drawn or spelled, never both. */
  readonly detail = input<string | undefined>(undefined);
  /** The relation between label and value, **drawn**: one of the design
   *  system's six comparison glyphs. Takes the place of `detail`. */
  readonly operator = input<ComparisonIconName | undefined>(undefined);
  /** The glyph's accessible name — "contains". Without one the glyph is
   *  decorative and the chip loses the relation for anyone who cannot see it. */
  readonly operatorLabel = input<string | undefined>(undefined);
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  /** Draws a trailing chevron, for a chip that opens a menu or popover. */
  readonly dropdown = input(false);
  /** Its popover is open, or it is toggled on. */
  readonly selected = input(false);
  /** The chip exists but does not yet stand for anything. */
  readonly incomplete = input(false);
  readonly disabled = input(false);
  /** Renders the dismiss button. `removeLabel` is its whole accessible name. */
  readonly removable = input(false);
  readonly removeLabel = input<string | undefined>(undefined);
  /** Fires when the chip's body is activated. Also makes the body a button. */
  readonly activate = output<MouseEvent>();
  readonly remove = output<MouseEvent>();
  /** Set when the chip opens something, so the body renders as a button. */
  readonly interactiveInput = input(false, { alias: "interactive" });

  /** Icons render at 16px across every chip size, exactly as `UioTag`'s do. */
  protected readonly ICON_SIZE = 16;
  /** The glyphs are drawn in a 16-unit box; they do not scale like the packs'. */
  protected readonly COMPARISON_ICON_SIZE = 16;

  protected readonly operatorMarkup = computed(() => {
    const name = this.operator();
    return name ? COMPARISON_ICONS[name] : undefined;
  });

  /**
   * `disabled` counts as interactive: there is nothing to disable on a static
   * token, and a real disabled control is also what exempts the dimmed label
   * from axe's contrast rule.
   */
  protected readonly interactive = computed(
    () => this.interactiveInput() || this.dropdown() || this.disabled(),
  );

  protected readonly hostClass = computed(() =>
    clsx(
      chipStyles({ variant: this.variant(), size: this.size() }),
      this.selected() && "chip--selected",
      this.incomplete() && "chip--incomplete",
      this.disabled() && "chip--disabled",
    ),
  );
}
