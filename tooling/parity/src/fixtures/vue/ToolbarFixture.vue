<script setup lang="ts">
import { Button, Divider, Toolbar, ToolbarGroup } from "@ui-organized/vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Toolbar v-bind="$attrs">
    <ToolbarGroup>
      <Button intent="ghost" size="sm">Bold</Button>
      <Button intent="ghost" size="sm">Italic</Button>
    </ToolbarGroup>
    <Divider orientation="vertical" />
    <Button intent="ghost" size="sm">Link</Button>
  </Toolbar>
</template>
