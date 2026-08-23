<!--
  The area that opens the menu on right-click (or long-press).

  Ark's ContextTrigger renders a <button>; the wiring is projected onto a plain
  <div> so the target stays an arbitrary content area with no button chrome and
  no nested-interactive markup. `asChild` works here — unlike on Separator —
  because Ark passes ContextTrigger a real slot rather than `null` children.
-->
<script setup lang="ts">
import { Menu as ArkMenu } from "@ark-ui/vue";
defineOptions({ inheritAttrs: false });
</script>

<template>
  <ArkMenu.ContextTrigger as-child>
    <div v-bind="$attrs"><slot /></div>
  </ArkMenu.ContextTrigger>
</template>
