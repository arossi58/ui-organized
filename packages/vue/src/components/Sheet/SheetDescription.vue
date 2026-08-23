<script setup lang="ts">
import { Dialog as ArkDialog } from "@ark-ui/vue";
</script>

<template>
  <ArkDialog.Description class="dialog__description text-default-body-medium">
    <slot />
  </ArkDialog.Description>
</template>
