<script setup lang="ts">
import { Select, Button } from "@ui-organized/vue";
</script>
<template>
  <div style="padding: var(--spacing-space-04)">
    <Select v-model="value" :options="opts" label="Role" />
    <Button intent="ghost" :on-value-change="x" variant="huge">Save</Button>
  </div>
</template>
