import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { meterStyles, type MeterVariants } from "@ui-organized/core";
import { nextMachineId } from "../part-ids.js";

export type MeterVariant = NonNullable<MeterVariants["variant"]>;
export type MeterSize = NonNullable<MeterVariants["size"]>;

/**
 * A static measurement inside a known range — disk usage, a score, a quota.
 *
 * ```html
 * <div uioMeter [value]="72" label="Disk usage" showValue></div>
 * ```
 *
 * Distinct from Progress, which tracks a task and can be indeterminate; a meter
 * never can. Ark UI has no Meter primitive and none is needed — everything here
 * is `role="meter"` plus the ARIA value attributes — so, like `UioToolbar`, this
 * does **not** extend `UioPart`: there is no machine behind it in any of the four
 * libraries, so no `data-scope`/`data-part` may appear on the element.
 *
 * ── The two numbers are not the same number ─────────────────────────────────
 *
 * The fill *clamps* to the range and the ARIA value does not. A meter told 140
 * out of 100 paints a full bar and still reports `aria-valuenow="140"`, because
 * clamping the announced value would silently tell a screen-reader user the
 * quota is exactly full when it has been blown through. All four libraries do
 * this; it is the pair of cases most likely to be "tidied" into agreement.
 */
@Component({
  selector: "div[uioMeter]",
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (showHeader()) {
      <div class="meter__header text-default-body-small">
        @if (hasLabel()) {
          <span class="meter__label" [id]="labelId">
            @if (labelTemplate(); as template) {
              <ng-container [ngTemplateOutlet]="template" />
            } @else {
              {{ label() }}
            }
          </span>
        }
        @if (showValue()) {
          <span class="meter__value">{{ formatted() }}</span>
        }
      </div>
    }
    <div class="meter__track">
      <div class="meter__indicator" [style.width.%]="percent()"></div>
    </div>
  `,
  host: {
    role: "meter",
    "[class]": "hostClass()",
    "[attr.aria-valuenow]": "value()",
    "[attr.aria-valuemin]": "min()",
    "[attr.aria-valuemax]": "max()",
    "[attr.aria-valuetext]": "formatted()",
    /**
     * A caption wins over the caller's name rather than both being emitted, and
     * with no caption the reference is dropped rather than left dangling — a
     * dangling IDREF outranks `aria-label`, so a meter naming a label that does
     * not exist reaches a screen reader unnamed.
     */
    "[attr.aria-labelledby]": "hasLabel() ? labelId : null",
    "[attr.aria-label]": "hasLabel() ? null : ariaLabel()",
  },
})
export class UioMeter {
  /**
   * The current value.
   *
   * Defaulted rather than `input.required`, which is what React's type says:
   * a required initializer-based input cannot be set at all under the JIT
   * compiler the specs in this package run under, so it would make the component
   * untestable here to express something a caller already gets from the types.
   * Zero is the honest reading of "nothing was measured".
   */
  readonly value = input(0);
  readonly min = input(0);
  readonly max = input(100);
  /** A string, or a template for anything richer — see `AccordionItem.content`. */
  readonly label = input<string | TemplateRef<unknown> | undefined>(undefined);
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Passed straight to `Intl.NumberFormat`, e.g. `{ style: "percent" }`. */
  readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
  readonly variant = input<MeterVariant>("default");
  readonly size = input<MeterSize>("md");
  /** Only used when the meter has no visible `label`. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /**
   * `role="meter"` needs an accessible name, and the caption is a sibling of
   * nothing — it lives inside the meter, so `aria-labelledby` has to name it by
   * id. The literal is not the contract; the parity gate numbers ids positionally.
   */
  protected readonly labelId = `meter:${nextMachineId()}:label`;

  protected readonly hasLabel = computed(() => this.label() != null);
  protected readonly showHeader = computed(() => this.hasLabel() || this.showValue());
  protected readonly labelTemplate = computed(() => {
    const label = this.label();
    return label instanceof TemplateRef ? label : null;
  });

  private readonly clamped = computed(() =>
    Math.min(Math.max(this.value(), this.min()), this.max()),
  );
  /** A zero-width range would divide by zero, so it reads as empty rather than NaN. */
  protected readonly percent = computed(() =>
    this.max() > this.min()
      ? ((this.clamped() - this.min()) / (this.max() - this.min())) * 100
      : 0,
  );
  protected readonly formatted = computed(() =>
    new Intl.NumberFormat(undefined, this.format()).format(this.value()),
  );

  protected readonly hostClass = computed(() =>
    meterStyles({ variant: this.variant(), size: this.size() }),
  );
}
