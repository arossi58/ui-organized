<script setup lang="ts">
import { NavProvider, NavSubItem } from "@ui-organized/vue";
defineProps<{ rail?: boolean }>();
</script>

<template>
  <NavProvider :collapsed="rail">
    <NavSubItem label="Weekly" v-bind="$attrs" />
  </NavProvider>
</template>
