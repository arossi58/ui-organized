<script setup lang="ts">
import { CodeBlock } from "@ui-organized/vue";
import { fakeHighlight } from "../codeHighlight.js";
// `highlighted` stands for the `highlight` function; see cases/CodeBlock.tsx.
defineProps<{ highlighted?: boolean }>();
</script>

<template>
  <CodeBlock v-bind="$attrs as any" :highlight="highlighted ? fakeHighlight : undefined" />
</template>
