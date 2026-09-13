<script setup lang="ts">
import { FileUpload } from "@ui-organized/vue";

/**
 * No rename here: this is the one controlled value Ark Vue does *not* call
 * `modelValue`, so `acceptedFiles` is spelled the same in all three libraries.
 */
</script>

<template>
  <FileUpload v-bind="$attrs" />
</template>
