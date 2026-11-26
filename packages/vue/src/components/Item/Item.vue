<!-- A row: media, a title with a line of description, and actions at the end. Slots: `media`, `actions`. -->
<script setup lang="ts">
import { computed, inject, useAttrs } from "vue";
import { clsx } from "clsx";
import { ITEM_ICON_SIZE, ITEM_TEXT_CLASS, itemStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { ITEM_GROUP_KEY } from "./context.js";
import type { ItemProps } from "./Item.types.js";
import "@ui-organized/core/components/Item/Item.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ItemProps>(), { variant: "plain", size: "md" });
const slots = defineSlots<{ media?: () => unknown; actions?: () => unknown }>();
const attrs = useAttrs();
const inGroup = inject(ITEM_GROUP_KEY, false);

const hasLink = computed(() => props.linkAs != null || props.href != null);
const rootClass = computed(() =>
  clsx(
    itemStyles({ variant: props.variant, size: props.size, link: hasLink.value }),
    attrs.class as string | undefined,
  ),
);
const text = computed(() => ITEM_TEXT_CLASS[props.size]);
const titleTag = computed(() => (props.headingLevel ? `h${props.headingLevel}` : "p"));
</script>

<template>
  <div :role="inGroup ? 'listitem' : undefined" :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div v-if="slots.media" class="item__media"><slot name="media" /></div>
    <div v-else-if="icon" class="item__media item__media--icon"><Icon :name="icon" :size="ITEM_ICON_SIZE[size]" /></div>
    <div class="item__body">
      <component :is="titleTag" :id="titleId" :class="['item__title', text.title]"
        ><component :is="linkAs" v-if="linkAs" v-bind="linkProps" class="item__link">{{ title }}</component
        ><a v-else-if="href != null" class="item__link" :href="href" :target="target" :rel="rel">{{ title }}</a
        ><template v-else>{{ title }}</template></component
      >
      <p v-if="description != null" :id="descriptionId" :class="['item__description', text.description]">
        {{ description }}
      </p>
    </div>
    <div v-if="slots.actions" class="item__actions"><slot name="actions" /></div>
  </div>
</template>
