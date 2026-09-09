<!--
  One bucket of options, rendered without a wrapper of its own.

  Split out because the grouped and ungrouped branches render the same item
  markup and a template cannot share a block between a `v-if` and its `v-else`.
  Writing it twice is how the two drift.
-->
<script setup lang="ts">
import { Listbox as ArkListbox } from "@ark-ui/vue";
import Icon from "../Icon/Icon.vue";
import type { ListboxOption } from "./Listbox.types.js";

defineProps<{ items: ListboxOption[]; iconSize: number }>();
</script>

<template>
  <ArkListbox.Item
    v-for="item in items"
    :key="item.value"
    :item="item"
    class="listbox__item"
  >
    <ArkListbox.ItemText class="listbox__item-text">{{ item.label }}</ArkListbox.ItemText>
    <ArkListbox.ItemIndicator class="listbox__item-indicator">
      <Icon name="check" :size="iconSize" />
    </ArkListbox.ItemIndicator>
  </ArkListbox.Item>
</template>
