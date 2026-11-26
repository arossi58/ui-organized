<!-- One number and what it means: a label, the value, and how it has moved. React's Stat renders the same markup. -->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    STAT_SENTIMENT_TAG_VARIANT,
    STAT_TEXT_CLASS,
    STAT_TREND_GLYPH,
    STAT_TREND_LABEL,
    resolveStatSentiment,
    statClass,
  } from "@ui-organized/core";
  import Tag from "../Tag/Tag.svelte";
  import type { StatProps } from "./Stat.types.js";
  import "@ui-organized/core/components/Card/Card.css";
  import "@ui-organized/core/components/Stat/Stat.css";
  import { glyph } from "../../icons/glyph.js";

  let {
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
    class: className,
    ...rest
  }: StatProps = $props();

  const text = $derived(STAT_TEXT_CLASS[size]);
  const tone = $derived(resolveStatSentiment(trend, sentiment));
</script>

<div class={clsx(statClass(variant, size), className)} {...rest}>
  <p class={clsx("stat__label", text.label)}>{label}</p>
  <p class={clsx("stat__value", text.value)}>{value}</p>
  {#if delta != null || description != null}
    <div class="stat__footer">
      {#if delta != null}
        <Tag
          class="stat__delta"
          variant={STAT_SENTIMENT_TAG_VARIANT[tone]}
          size="sm"
          appearance="subtle"
          icon={trend ? glyph(STAT_TREND_GLYPH[trend]) : undefined}
        >{#if trend}<span class="stat__sr">{trendLabel ?? STAT_TREND_LABEL[trend]}, </span>{/if}{delta}</Tag>
      {/if}
      {#if description != null}<p class={clsx("stat__description", text.description)}>{description}</p>{/if}
    </div>
  {/if}
  {#if chart}<div class="stat__chart">{@render chart()}</div>{/if}
</div>
