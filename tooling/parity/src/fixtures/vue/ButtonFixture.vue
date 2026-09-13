<script setup lang="ts">
import { Button } from "@ui-organized/vue";

// See ButtonFixture.svelte for why `iconOnly` branches outside the component.
defineProps<{ iconOnly?: boolean }>();
</script>

<template>
  <Button v-if="iconOnly" v-bind="$attrs" />
  <Button v-else v-bind="$attrs">Label</Button>
</template>
