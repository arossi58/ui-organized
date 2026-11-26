<!--
  The chosen values as tags on one line, with a "+N" for those that do not fit.
  Every tag renders so it can be measured; the overflow is marked and hidden by
  CSS. Without layout (the server, jsdom) nothing is measured and all show.
  React's SelectTags does the same.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useSelectContext } from "@ark-ui/vue";
import { clsx } from "clsx";
import { measureTagRow, tagStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { SelectOption } from "./Select.types.js";

const props = defineProps<{ options: SelectOption[] }>();
const select = useSelectContext();
const row = ref<HTMLDivElement | null>(null);
const fits = ref<number | null>(null);

const chosen = computed(() =>
  select.value.value
    .map((v) => props.options.find((o) => o.value === v))
    .filter((o): o is SelectOption => o != null),
);

let observer: ResizeObserver | null = null;
function measure() {
  const el = row.value;
  if (!el) return;
  fits.value = measureTagRow(el, Number.parseFloat(getComputedStyle(el).columnGap) || 0);
}
watch(
  [row, () => chosen.value.length],
  () => {
    observer?.disconnect();
    const el = row.value;
    if (!el) return;
    measure();
    if (typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const tag of el.querySelectorAll(":scope > [data-tag]")) observer.observe(tag);
  },
  { flush: "post", immediate: true },
);
onBeforeUnmount(() => observer?.disconnect());

const shown = computed(() => fits.value ?? chosen.value.length);
const more = computed(() => chosen.value.length - shown.value);
const tag = tagStyles({ variant: "neutral", size: "sm", appearance: "subtle" });
</script>

<template>
  <div ref="row" class="select-field__tags" aria-hidden="true">
    <span
      v-for="(option, i) in chosen"
      :key="option.value"
      :class="tag"
      data-tag=""
      :data-overflowed="i >= shown ? '' : undefined"
    >
      <span class="tag__label">{{ option.label }}</span>
      <button
        type="button"
        class="tag__remove"
        tabindex="-1"
        :aria-label="`Remove ${option.label}`"
        @pointerdown.prevent
        @click="select.clearValue(option.value)"
      >
        <Icon :name="glyph('close')" :size="12" />
      </button>
    </span>
    <span v-if="more > 0" :class="clsx(tag, 'select-field__tag-more')"><span class="tag__label">+{{ more }}</span></span>
  </div>
</template>
