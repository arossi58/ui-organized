import { Component, Directive, computed, input } from "@angular/core";
import { clsx } from "clsx";
import {
  STAT_SENTIMENT_TAG_VARIANT,
  STAT_TEXT_CLASS,
  STAT_TREND_GLYPH,
  STAT_TREND_LABEL,
  resolveStatSentiment,
  statClass,
  type StatSentiment,
  type StatSize,
  type StatTrend,
} from "@ui-organized/core";
import { UioTag } from "../tag/tag.js";
import { glyph } from "../icons/glyph.js";

export type { StatSentiment, StatSize, StatTrend };

/** A small chart under a Stat's numbers. The element is the slot itself. */
@Directive({
  selector: "[uioStatChart]",
  standalone: true,
  host: { class: "stat__chart" },
})
export class UioStatChart {}

/**
 * One number and what it means: a label, the value, and how it has moved.
 *
 * ```html
 * <div uioStat label="Revenue" value="$48,260" delta="+12.4%" trend="up" description="vs last month"></div>
 * ```
 *
 * The delta's arrow is decoration; the direction is also written out,
 * visually hidden, before it.
 */
@Component({
  selector: "div[uioStat]",
  standalone: true,
  imports: [UioTag],
  template: `
    <p [class]="labelClass()">{{ label() }}</p>
    <p [class]="valueClass()">{{ value() }}</p>
    @if (delta() != null || description() != null) {
      <div class="stat__footer">
        @if (delta(); as text) {
          <span
            uioTag
            class="stat__delta"
            [variant]="tagVariant()"
            size="sm"
            appearance="subtle"
            [icon]="icon()"
          >
            @if (trend(); as t) {
              <span class="stat__sr">{{ trendLabel() ?? TREND_LABEL[t] }}, </span>
            }
            {{ text }}</span
          >
        }
        @if (description(); as text) {
          <p [class]="descriptionClass()">{{ text }}</p>
        }
      </div>
    }
    <ng-content select="[uioStatChart]" />
  `,
  host: { "[class]": "hostClass()" },
})
export class UioStat {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input<string | undefined>(undefined);
  readonly trend = input<StatTrend | undefined>(undefined);
  /** Defaults from `trend`: up is positive, down negative. Set it where up is bad. */
  readonly sentiment = input<StatSentiment | undefined>(undefined);
  readonly trendLabel = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly variant = input<"card" | "plain">("card");
  readonly size = input<StatSize>("md");

  protected readonly TREND_LABEL = STAT_TREND_LABEL;
  protected readonly hostClass = computed(() => statClass(this.variant(), this.size()));
  protected readonly labelClass = computed(() =>
    clsx("stat__label", STAT_TEXT_CLASS[this.size()].label),
  );
  protected readonly valueClass = computed(() =>
    clsx("stat__value", STAT_TEXT_CLASS[this.size()].value),
  );
  protected readonly descriptionClass = computed(() =>
    clsx("stat__description", STAT_TEXT_CLASS[this.size()].description),
  );
  protected readonly tagVariant = computed(
    () => STAT_SENTIMENT_TAG_VARIANT[resolveStatSentiment(this.trend(), this.sentiment())],
  );
  protected readonly icon = computed(() => {
    const trend = this.trend();
    return trend ? glyph(STAT_TREND_GLYPH[trend]) : undefined;
  });
}
