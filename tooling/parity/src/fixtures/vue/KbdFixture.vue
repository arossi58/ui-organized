<script setup lang="ts">
import { Kbd } from "@ui-organized/vue";
// `text` stands for the default slot; see cases/Kbd.tsx.
defineProps<{ text?: string }>();
</script>

<template>
  <Kbd v-bind="$attrs"><template v-if="text">{{ text }}</template></Kbd>
</template>
