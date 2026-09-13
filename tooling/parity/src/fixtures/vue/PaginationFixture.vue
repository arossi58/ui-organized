<script setup lang="ts">
import { Pagination } from "@ui-organized/vue";

// No callback to supply: where React takes `onPageChange`, Vue emits.
defineOptions({ inheritAttrs: false });
</script>

<template>
  <Pagination v-bind="$attrs" />
</template>
