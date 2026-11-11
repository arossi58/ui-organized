import { Component, Directive, ElementRef, computed, inject, input, output } from "@angular/core";
import { UioIcon } from "../icons/icon.js";
import { clsx } from "clsx";
import { chipSegmentStyles, chipStyles, type ChipSegmentPart } from "@ui-organized/core";
import { glyph } from "../icons/glyph.js";

/**
 * A compact token standing for something the user added — a filter, a facet, a
 * recipient — which they can then edit or remove.
 *
 * Segmented (Figma 2462:2636): "Name | is greater than | Value" is three
 * controls, each opening the menu for the one parameter it shows. Every segment
 * and the dismiss control are **siblings** inside the host: a button nested in
 * a button is invalid HTML and an axe `nested-interactive` violation.
 *
 * `label`/`operator`/`value` are shorthand for static segments. For a chip
 * whose parts each open something, project `uioChipSegment` buttons instead —
 * each one can then carry its own `uioMenuTrigger` or `uioPopoverTrigger`,
 * which is how the table's filter chip is built.
 */
@Component({
  selector: "span[uioChip]",
  standalone: true,
  imports: [UioIcon],
  template: `
    <!-- Static shorthand segments. A segment that opens nothing is a span, or
         every token in a list puts empty stops in the tab order — except when
         disabled, where a real disabled control is what exempts the dimmed text
         from axe's contrast rule. Same rule as React's ChipSegment. -->
    @for (segment of segments(); track segment.part) {
      @if (disabled()) {
        <button type="button" [class]="segment.className" disabled>{{ segment.text }}</button>
      } @else {
        <span [class]="segment.className">{{ segment.text }}</span>
      }
    }
    <ng-content />

    @if (removable()) {
      <button
        type="button"
        class="chip__remove"
        [attr.aria-label]="removeLabel()"
        [disabled]="disabled()"
        (click)="remove.emit($event)"
      >
        <span uioIcon [name]="glyph('close')" [size]="ICON_SIZE"></span>
      </button>
    }
  `,
  host: { role: "group", "[class]": "hostClass()" },
})
export class UioChip {
  protected readonly glyph = glyph;
  /** Shorthand for a static label segment — what the chip is *about*. Never truncated. */
  readonly label = input<string | null | undefined>(undefined);
  /** Shorthand for a static operator segment: "is any of", "is before". Always spelled. */
  readonly operator = input<string | null | undefined>(undefined);
  /** Shorthand for a static value segment. The only part that truncates. */
  readonly value = input<string | null | undefined>(undefined);
  /** One of its menus is open, or it is toggled on. Fills the chip with brand. */
  readonly selected = input(false);
  /** The chip exists but does not yet stand for anything. */
  readonly incomplete = input(false);
  /** Disables every segment and the dismiss control. */
  readonly disabled = input(false);
  /** Renders the dismiss button. `removeLabel` is its whole accessible name. */
  readonly removable = input(false);
  readonly removeLabel = input<string | undefined>(undefined);
  readonly remove = output<MouseEvent>();

  /** The dismiss icon, at the size `UioTag`'s icons render. */
  protected readonly ICON_SIZE = 16;

  protected readonly segments = computed(() =>
    (
      [
        ["label", this.label()],
        ["operator", this.operator()],
        ["value", this.value()],
      ] as const
    )
      .filter(([, text]) => text !== undefined && text !== null)
      .map(([part, text]) => ({ part, text, className: chipSegmentStyles({ part }) })),
  );

  protected readonly hostClass = computed(() =>
    clsx(
      chipStyles(),
      this.selected() && "chip--selected",
      this.incomplete() && "chip--incomplete",
      this.disabled() && "chip--disabled",
    ),
  );
}

/**
 * One part of a chip's sentence, projected into a `uioChip`.
 *
 * A directive, not a component, so it adds no element: segments have to be
 * direct children of `.chip` for the dividers and the pill's end padding to
 * land. Put it on a `<button>` when the segment opens something and on a
 * `<span>` when it does not — Angular cannot swap the element the way React's
 * `ChipSegment` does, so the consumer chooses.
 */
@Directive({
  selector: "button[uioChipSegment], span[uioChipSegment]",
  standalone: true,
  host: {
    "[class]": "segmentClass()",
    "[attr.type]": "isButton ? 'button' : null",
    "[attr.disabled]": "isButton && isDisabled() ? '' : null",
  },
})
export class UioChipSegment {
  /** Which part of the chip's sentence this is. Decides its padding and ink. */
  readonly part = input<ChipSegmentPart>("value");
  readonly disabled = input(false);

  private readonly chip = inject(UioChip, { optional: true });
  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === "BUTTON";

  protected readonly isDisabled = computed(() => this.disabled() || !!this.chip?.disabled());
  protected readonly segmentClass = computed(() => chipSegmentStyles({ part: this.part() }));
}
