<script setup lang="ts">
import { FieldError } from "@ui-organized/vue";
defineProps<{ message?: string }>();
</script>

<template>
  <FieldError :message="message" />
</template>
