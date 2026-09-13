<script setup lang="ts">
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@ui-organized/vue";

// `triggerLabel` and `body` are the fixture's own props, not the root's — the
// compound has to be assembled before anything can be compared.
withDefaults(defineProps<{ triggerLabel?: string; body?: string }>(), {
  triggerLabel: "Details",
  body: "Panel body",
});
</script>

<template>
  <Collapsible v-bind="$attrs">
    <CollapsibleTrigger>{{ triggerLabel }}</CollapsibleTrigger>
    <CollapsibleContent>{{ body }}</CollapsibleContent>
  </Collapsible>
</template>
