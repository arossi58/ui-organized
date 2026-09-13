<!-- Closes the dialog when activated. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { Dialog as ArkDialog } from "@ark-ui/vue";
defineProps<{ asChild?: boolean }>();
</script>

<template>
  <ArkDialog.CloseTrigger :as-child="asChild"><slot /></ArkDialog.CloseTrigger>
</template>
