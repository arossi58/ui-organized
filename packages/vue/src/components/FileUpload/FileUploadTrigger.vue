<!--
  The browse control.

  Its own component only so the two layouts can share it: `variant="button"`
  renders the trigger alone, every other variant renders it inside the dropzone,
  and Vue has no way to name a fragment of a template for reuse.

  The trigger *is* the library Button, projected through Ark's `as-child` so it
  inherits every interactive token instead of restating them.
-->
<script setup lang="ts">
import { FileUpload as ArkFileUpload } from "@ark-ui/vue";
import type { ControlSize } from "@ui-organized/core";
import Button from "../Button/Button.vue";

defineProps<{ label: string; size: ControlSize }>();
</script>

<template>
  <ArkFileUpload.Trigger as-child>
    <Button intent="secondary" :size="size" type="button">{{ label }}</Button>
  </ArkFileUpload.Trigger>
</template>
