<script setup lang="ts">
import { Meter } from "@ui-organized/vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <!--
    `aria-label` is passed straight through rather than renamed: Vue camelises an
    incoming key before matching it against the declared props, so the hyphenated
    spelling reaches `Meter`'s `ariaLabel` on its own.
  -->
  <Meter v-bind="$attrs" />
</template>
