<!-- Outline cut of the fake icon library. See ../stubIconSet.ts. -->
<script setup lang="ts">
defineProps<{ size?: number; strokeWidth?: number }>();
</script>

<template>
  <svg data-cut="outline" :data-size="size" :data-stroke="strokeWidth" />
</template>
