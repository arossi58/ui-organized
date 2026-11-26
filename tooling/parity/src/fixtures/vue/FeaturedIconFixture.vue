<script setup lang="ts">
import { FeaturedIcon } from "@ui-organized/vue";
</script>

<template>
  <FeaturedIcon v-bind="{ icon: 'check', ...$attrs }" />
</template>
