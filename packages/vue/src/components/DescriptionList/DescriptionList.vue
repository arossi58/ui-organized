<!--
  Terms and their details, such as a record's fields. Pass `items` for plain
  data, or DescriptionListItems in the default slot for details with markup.
  React's DescriptionList renders the same markup.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { descriptionListStyles } from "@ui-organized/core";
import DescriptionListItem from "./DescriptionListItem.vue";
import type { DescriptionListProps } from "./DescriptionList.types.js";
import "@ui-organized/core/components/DescriptionList/DescriptionList.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<DescriptionListProps>(), { layout: "inline", size: "md", divided: undefined });
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    descriptionListStyles({ layout: props.layout, size: props.size, divided: props.divided }),
    attrs.class as string | undefined,
  ),
);
</script>

<template>
  <dl :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <DescriptionListItem v-for="(item, i) in items ?? []" :key="i" :term="item.term">{{ item.details }}</DescriptionListItem>
    <slot />
  </dl>
</template>
