<!-- One number and what it means: a label, the value, and how it has moved. Slot: `chart`. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import {
  STAT_SENTIMENT_TAG_VARIANT,
  STAT_TEXT_CLASS,
  STAT_TREND_GLYPH,
  STAT_TREND_LABEL,
  resolveStatSentiment,
  statClass,
} from "@ui-organized/core";
import Tag from "../Tag/Tag.vue";
import type { StatProps } from "./Stat.types.js";
import "@ui-organized/core/components/Card/Card.css";
import "@ui-organized/core/components/Stat/Stat.css";
import { glyph } from "../../icons/glyph.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<StatProps>(), { variant: "card", size: "md" });
const slots = defineSlots<{ chart?: () => unknown }>();
const attrs = useAttrs();

const rootClass = computed(() => clsx(statClass(props.variant, props.size), attrs.class as string | undefined));
const text = computed(() => STAT_TEXT_CLASS[props.size]);
const tone = computed(() => resolveStatSentiment(props.trend, props.sentiment));
const icon = computed(() => (props.trend ? glyph(STAT_TREND_GLYPH[props.trend]) : undefined));
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <p :class="['stat__label', text.label]">{{ label }}</p>
    <p :class="['stat__value', text.value]">{{ value }}</p>
    <div v-if="delta != null || description != null" class="stat__footer">
      <Tag
        v-if="delta != null"
        class="stat__delta"
        :variant="STAT_SENTIMENT_TAG_VARIANT[tone]"
        size="sm"
        appearance="subtle"
        :icon="icon"
      ><span v-if="trend" class="stat__sr">{{ trendLabel ?? STAT_TREND_LABEL[trend] }}, </span>{{ delta }}</Tag>
      <p v-if="description != null" :class="['stat__description', text.description]">{{ description }}</p>
    </div>
    <div v-if="slots.chart" class="stat__chart"><slot name="chart" /></div>
  </div>
</template>
