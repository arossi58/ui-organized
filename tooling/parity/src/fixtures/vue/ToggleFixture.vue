<script setup lang="ts">
import { Toggle, ToggleGroup } from "@ui-organized/vue";

/**
 * `label` and `items` are the fixture's own: a Vue label is a slot, which cannot
 * be handed over as a case prop, and a group is the same component with children
 * rather than a second entry point.
 *
 * Both branches take the label's absence seriously rather than rendering an empty
 * slot — an always-present default slot reads as "I have content" and would turn
 * every icon-only toggle into a labelled one.
 */
defineProps<{ label?: string; items?: Record<string, any>[] }>();
defineOptions({ inheritAttrs: false });
</script>

<template>
  <ToggleGroup v-if="items" v-bind="$attrs">
    <template v-for="item in items" :key="item.value">
      <Toggle
        v-if="item.label === undefined"
        :value="item.value"
        :icon="item.icon"
        :disabled="item.disabled"
      />
      <Toggle v-else :value="item.value" :icon="item.icon" :disabled="item.disabled">
        {{ item.label }}
      </Toggle>
    </template>
  </ToggleGroup>
  <Toggle v-else-if="label === undefined" v-bind="$attrs" />
  <Toggle v-else v-bind="$attrs">{{ label }}</Toggle>
</template>
