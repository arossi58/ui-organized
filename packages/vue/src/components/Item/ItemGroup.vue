<!-- Rows that belong together, as a list: each Item inside is one of its list items. -->
<script setup lang="ts">
import { computed, provide, useAttrs } from "vue";
import { clsx } from "clsx";
import { itemGroupStyles } from "@ui-organized/core";
import { ITEM_GROUP_KEY } from "./context.js";
import type { ItemGroupProps } from "./Item.types.js";
import "@ui-organized/core/components/Item/Item.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ItemGroupProps>(), { variant: "plain", divided: true });
const attrs = useAttrs();
provide(ITEM_GROUP_KEY, true);

const rootClass = computed(() =>
  clsx(itemGroupStyles({ variant: props.variant, divided: props.divided }), attrs.class as string | undefined),
);
</script>

<template>
  <div role="list" :class="rootClass" v-bind="{ ...$attrs, class: undefined }"><slot /></div>
</template>
