<!--
  The chosen values as tags before the text box, with a "+N" for those that do
  not fit. Every tag renders so it can be measured; the overflow is marked and
  hidden by CSS. Without layout (the server, jsdom) all show. React's
  ComboboxTags does the same.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useComboboxContext } from "@ark-ui/vue";
import { clsx } from "clsx";
import { measureTagRow, tagStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { ComboboxOption } from "./Combobox.types.js";

const props = defineProps<{ options: ComboboxOption[] }>();
const combobox = useComboboxContext();
const row = ref<HTMLDivElement | null>(null);
const fits = ref<number | null>(null);

const chosen = computed(() =>
  combobox.value.value
    .map((v) => props.options.find((o) => o.value === v))
    .filter((o): o is ComboboxOption => o != null),
);

let observer: ResizeObserver | null = null;
/**
 * The text box after the row takes the rest of the line, so its room above
 * its minimum is the row's too; the row's padding is not. See measureTagRow.
 */
function extra(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const padding = (Number.parseFloat(style.paddingInlineStart) || 0) + (Number.parseFloat(style.paddingInlineEnd) || 0);
  const next = el.nextElementSibling;
  if (!(next instanceof HTMLElement)) return -padding;
  const min = Number.parseFloat(getComputedStyle(next).minWidth) || 0;
  return Math.max(0, next.getBoundingClientRect().width - min) - padding;
}
function measure() {
  const el = row.value;
  if (!el) return;
  fits.value = measureTagRow(el, Number.parseFloat(getComputedStyle(el).columnGap) || 0, extra(el));
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
    if (el.nextElementSibling) observer.observe(el.nextElementSibling);
  },
  { flush: "post", immediate: true },
);
onBeforeUnmount(() => observer?.disconnect());

const shown = computed(() => fits.value ?? chosen.value.length);
const more = computed(() => chosen.value.length - shown.value);
const tag = tagStyles({ variant: "neutral", size: "sm", appearance: "subtle" });
</script>

<template>
  <div v-if="chosen.length > 0" ref="row" class="combobox-field__tags">
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
        @click="combobox.clearValue(option.value)"
      >
        <Icon :name="glyph('close')" :size="12" />
      </button>
    </span>
    <span v-if="more > 0" :class="clsx(tag, 'combobox-field__tag-more')"><span class="tag__label">+{{ more }}</span></span>
  </div>
</template>
