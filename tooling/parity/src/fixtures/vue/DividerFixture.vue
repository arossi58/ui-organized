<script setup lang="ts">
import { Divider } from "@ui-organized/vue";

// `label` stands for the default slot; see cases/Divider.tsx.
defineProps<{ label?: string }>();
</script>

<template>
  <Divider v-if="label" v-bind="$attrs">{{ label }}</Divider>
  <Divider v-else v-bind="$attrs" />
</template>
