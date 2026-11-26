import { clsx } from "clsx";
import {
  STAT_SENTIMENT_TAG_VARIANT,
  STAT_TEXT_CLASS,
  STAT_TREND_GLYPH,
  STAT_TREND_LABEL,
  resolveStatSentiment,
  statClass,
} from "@ui-organized/core";
import { Tag } from "../Tag/index.js";
import type { StatProps } from "./Stat.types.js";
import "@ui-organized/core/components/Card/Card.css";
import "@ui-organized/core/components/Stat/Stat.css";
import { glyph } from "../../icons/glyph.js";

/** One number and what it means: a label, the value, and how it has moved. */
export function Stat({
  label,
  value,
  delta,
  trend,
  sentiment,
  trendLabel,
  description,
  chart,
  variant = "card",
  size = "md",
  className,
  ...props
}: StatProps) {
  const text = STAT_TEXT_CLASS[size];
  const tone = resolveStatSentiment(trend, sentiment);
  return (
    <div className={clsx(statClass(variant, size), className)} {...props}>
      <p className={clsx("stat__label", text.label)}>{label}</p>
      <p className={clsx("stat__value", text.value)}>{value}</p>
      {(delta != null || description != null) && (
        <div className="stat__footer">
          {delta != null && (
            <Tag
              className="stat__delta"
              variant={STAT_SENTIMENT_TAG_VARIANT[tone]}
              size="sm"
              appearance="subtle"
              icon={trend ? glyph(STAT_TREND_GLYPH[trend]) : undefined}
            >
              {trend && <span className="stat__sr">{trendLabel ?? STAT_TREND_LABEL[trend]}, </span>}
              {delta}
            </Tag>
          )}
          {description != null && (
            <p className={clsx("stat__description", text.description)}>{description}</p>
          )}
        </div>
      )}
      {chart != null && <div className="stat__chart">{chart}</div>}
    </div>
  );
}
