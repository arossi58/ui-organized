<script setup lang="ts">
import { Button, Input } from "@ui-organized/vue";

// `withButton` stands for the slot add-on; see cases/Input.tsx.
defineProps<{ withButton?: boolean }>();
</script>

<template>
  <Input v-bind="$attrs">
    <template v-if="withButton" #end-addon><Button intent="secondary">Copy</Button></template>
  </Input>
</template>
