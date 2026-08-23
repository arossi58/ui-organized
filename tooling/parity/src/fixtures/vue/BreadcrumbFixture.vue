<script setup lang="ts">
import { Breadcrumb } from "@ui-organized/vue";

// React takes the separator as a node prop; Vue takes it as a slot, so the
// fixture translates — the same job it does for `className`. A conditional
// template rather than an always-present one, because an empty slot is still a
// slot and would suppress the default chevron.
defineOptions({ inheritAttrs: false });
defineProps<{ separator?: string }>();
</script>

<template>
  <Breadcrumb v-bind="$attrs">
    <template v-if="separator" #separator>{{ separator }}</template>
  </Breadcrumb>
</template>
