<script setup lang="ts">
import { Dialog as ArkDialog } from "@ark-ui/vue";
</script>

<template>
  <ArkDialog.Title class="dialog__title text-strong-heading-small"><slot /></ArkDialog.Title>
</template>
