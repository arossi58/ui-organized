<script setup lang="ts">
import { QRCode } from "@ui-organized/vue";

// `overlay` arrives as a boolean — see the note in cases/QRCode.tsx. React takes
// a node and Svelte a snippet; here it is a named slot, and the flag chooses
// whether to fill it.
defineOptions({ inheritAttrs: false });
defineProps<{ overlay?: boolean }>();
</script>

<template>
  <QRCode v-bind="$attrs">
    <template v-if="overlay" #overlay><span class="qr-overlay-probe">logo</span></template>
  </QRCode>
</template>
