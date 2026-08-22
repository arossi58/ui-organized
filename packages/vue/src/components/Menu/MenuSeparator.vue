<!--
  Renders the design-system Divider as the separator surface; Ark's Separator
  merges its semantics and props onto it via asChild. The `menu__separator` class
  only adds the menu's block spacing around the rule.
-->
<script setup lang="ts">
import { Menu as ArkMenu } from "@ark-ui/vue";
import Divider from "../Divider/Divider.vue";
</script>

<template>
  <ArkMenu.Separator as-child>
    <Divider class="menu__separator" />
  </ArkMenu.Separator>
</template>
