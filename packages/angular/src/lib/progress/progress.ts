import { Component, computed, input, type Signal } from "@angular/core";
import { clsx } from "clsx";
import { progressStyles, type ProgressVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";

export type ProgressVariant = NonNullable<ProgressVariants["variant"]>;
export type ProgressSize = NonNullable<ProgressVariants["size"]>;
export type ProgressShape = NonNullable<ProgressVariants["shape"]>;

/**
 * The geometry Ark writes onto both circles, as an inline style string.
 *
 * Every value is a CSS custom property or a geometry property the ring's own
 * rule fills in, so this is layout the component owns rather than theming — a
 * class would put half of a single calculation in the stylesheet and leave the
 * other half here.
 */
const CIRCLE_GEOMETRY =
  "--radius: calc(var(--size) / 2 - var(--thickness) / 2); cx: calc(var(--size) / 2); " +
  "cy: calc(var(--size) / 2); r: var(--radius); fill: transparent; " +
  "stroke-width: var(--thickness);";

/**
 * A task in flight, as a bar or a ring.
 *
 * ```html
 * <div uioProgress [value]="40" label="Uploading" showValue></div>
 * <div uioProgress [value]="null"></div>
 * ```
 *
 * Distinct from `UioMeter`, which reports a static measurement and can never be
 * indeterminate. This can, and that fork is the component: a `null` value drops
 * `data-value`, drops `aria-valuenow`, drops the width entirely so the CSS
 * animation owns it, and reports `data-state="indeterminate"` — which is the one
 * attribute `Progress.css` selects on. A port that treated `null` as zero would
 * render a bar that is merely empty, and pass every static check.
 *
 * ── The three numbers ───────────────────────────────────────────────────────
 *
 * `value` is the caller's, `data-max` and `aria-valuemax` are the range, and
 * everything a human reads — the value text, and the `aria-label` on the
 * progressbar — is the **percentage**, formatted. Ark does not announce "3 of
 * 5"; it announces "60%". Reproducing that means the formatter, not string
 * concatenation, because a locale decides where the sign goes.
 */
@Component({
  selector: "div[uioProgress]",
  standalone: true,
  template: `
    @if (showHeader()) {
      <div class="progress__header text-default-body-small">
        @if (label(); as text) {
          <span
            class="progress__label"
            data-scope="progress"
            data-part="label"
            data-orientation="horizontal"
            [id]="partId('label')"
            >{{ text }}</span
          >
        }
        <!--
          A ring has room inside it, so the value sits in the middle rather than
          in the header — see the circular branch below. The header itself still
          renders, empty, exactly as it does in the other three: showValue
          alone is enough to ask for one.
        -->
        @if (showValue() && !isCircular()) {
          <span
            class="progress__value"
            data-scope="progress"
            data-part="value-text"
            aria-live="polite"
            >{{ percentText() }}</span
          >
        }
      </div>
    }
    @if (isCircular()) {
      <div class="progress__circle-wrap">
        <svg
          class="progress__circle"
          data-scope="progress"
          data-part="circle"
          role="progressbar"
          data-orientation="horizontal"
          style="width: var(--size); height: var(--size);"
          [id]="partId('circle')"
          [attr.aria-label]="valueText()"
          [attr.data-max]="max()"
          [attr.aria-valuemin]="min"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="value()"
          [attr.data-state]="state()"
        >
          <circle
            class="progress__circle-track"
            data-scope="progress"
            data-part="circle-track"
            data-orientation="horizontal"
            [attr.style]="CIRCLE_GEOMETRY"
          ></circle>
          <circle
            class="progress__circle-range"
            data-scope="progress"
            data-part="circle-range"
            [attr.data-state]="state()"
            [attr.style]="rangeGeometry()"
          ></circle>
        </svg>
        @if (showValue()) {
          <span
            class="progress__circle-value text-emphasis-body-medium"
            data-scope="progress"
            data-part="value-text"
            aria-live="polite"
            >{{ percentText() }}</span
          >
        }
      </div>
    } @else {
      <div
        class="progress__track"
        data-scope="progress"
        data-part="track"
        role="progressbar"
        data-orientation="horizontal"
        [id]="partId('track')"
        [attr.aria-label]="valueText()"
        [attr.data-max]="max()"
        [attr.aria-valuemin]="min"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value()"
        [attr.data-state]="state()"
      >
        <div
          class="progress__indicator"
          data-scope="progress"
          data-part="range"
          data-orientation="horizontal"
          [attr.data-state]="state()"
          [style.width]="indeterminate() ? null : percent() + '%'"
        ></div>
      </div>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.data-max]": "max()",
    /** Dropped entirely when indeterminate, not written as an empty string. */
    "[attr.data-value]": "value()",
    /**
     * Written as the whole `style` attribute rather than through
     * `[style.--percent]`, so the custom property reaches the element the same
     * way in a JIT-compiled spec as it does in the built package. `Progress.css`
     * reads `--percent`; nothing else on this host is styled inline.
     */
    "[attr.style]": "rootStyle()",
  },
})
export class UioProgress extends UioPart {
  readonly scope = "progress";
  readonly part = "root";

  /** `null` is the indeterminate case, and is the default in every library here. */
  readonly value = input<number | null>(null);
  readonly max = input(100);
  readonly label = input<string | undefined>(undefined);
  readonly showValue = input(false);
  readonly variant = input<ProgressVariant>("default");
  readonly size = input<ProgressSize>("md");
  readonly shape = input<ProgressShape>("linear");

  /** Ark's Progress has no `min` prop; the floor of the range is always zero. */
  protected readonly min = 0;
  protected readonly CIRCLE_GEOMETRY = CIRCLE_GEOMETRY;

  private readonly machine = nextMachineId();

  protected readonly indeterminate = computed(() => this.value() === null);
  protected readonly isCircular = computed(() => this.shape() === "circular");
  protected readonly showHeader = computed(() => this.label() != null || this.showValue());

  /**
   * Zag's three words, and the reason `complete` exists separately from
   * `loading`: a bar that has finished is a different thing from one that is
   * nearly there, and the stylesheet is free to say so.
   */
  override readonly state: Signal<string> = computed(() => {
    const value = this.value();
    if (value === null) return "indeterminate";
    return value === this.max() ? "complete" : "loading";
  });
  override readonly orientation: Signal<"horizontal"> = computed(() => "horizontal");

  protected readonly percent = computed(() => {
    const value = this.value();
    if (value === null) return -1;
    const max = this.max();
    // A zero-width range would divide by zero; an empty bar is the honest read.
    return max > 0 ? (value / max) * 100 : 0;
  });

  private readonly formatter = computed(
    () => new Intl.NumberFormat(undefined, { style: "percent" }),
  );

  /** What `ValueText` shows: the percentage, never the raw value. */
  protected readonly percentText = computed(() =>
    this.indeterminate() ? "" : this.formatter().format(this.percent() / 100),
  );

  /**
   * The progressbar's accessible name.
   *
   * Ark names the bar after its own reading rather than after the label beside
   * it, and says "loading..." while there is no reading to give. Both are what a
   * screen reader announces, so both are contract.
   */
  protected readonly valueText = computed(() =>
    this.indeterminate() ? "loading..." : this.percentText(),
  );

  protected readonly hostClass = computed(() =>
    clsx(progressStyles({ variant: this.variant(), size: this.size(), shape: this.shape() })),
  );

  /** No `--percent` at all while indeterminate: the animation owns the fill. */
  protected readonly rootStyle = computed(() =>
    this.indeterminate() ? null : `--percent: ${this.percent()};`,
  );

  /**
   * The ring's stroke, expressed the way zag does: as custom properties the
   * dash offset is computed from, so the arc animates in CSS rather than being
   * re-measured on every value change.
   */
  protected readonly rangeGeometry = computed(() => {
    const dashArray = this.indeterminate() ? "" : "stroke-dasharray: var(--circumference);";
    return (
      `${CIRCLE_GEOMETRY} --percent: ${this.percent()}; ` +
      "--circumference: calc(2 * 3.14159 * var(--radius)); " +
      "--offset: calc(var(--circumference) * (100 - var(--percent)) / 100); " +
      "stroke-dashoffset: calc(var(--circumference) * ((100 - var(--percent)) / 100)); " +
      `${dashArray} transform-origin: center center; transform: rotate(-90deg);`
    );
  });

  /**
   * Dashes, not colons — Progress is the one machine in this package whose zag
   * ids are `progress-<id>-<part>` rather than `<scope>:<id>:<part>`.
   *
   * Worth copying rather than tidying. The parity harness recovers a machine id
   * by stripping `<scope>:` and `:<part>` off an element's id, and only then can
   * it compare a reference that names the machine rather than an element. A
   * colon-shaped id here would give Angular a machine placeholder React does not
   * have, which is a difference invented by the port.
   */
  get rootId(): string {
    return `progress-${this.machine}`;
  }
  protected partId(part: string): string {
    return `progress-${this.machine}-${part}`;
  }
}
