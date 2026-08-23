<!--
  Confirms the action and closes. Listen for `click` to run the action.

  A CloseTrigger rather than a plain button, so the dialog closes whether or not
  the handler throws — an alert left open over a failed action reads as "nothing
  happened" and invites a second click.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import { clsx } from "clsx";
import { buttonStyles } from "@ui-organized/core";
import type { AlertDialogConfirmProps } from "./AlertDialog.types.js";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AlertDialogConfirmProps>(), { intent: "primary" });
const attrs = useAttrs();
const buttonClass = computed(() =>
  clsx(buttonStyles({ intent: props.intent }), attrs.class as string),
);
</script>

<template>
  <ArkDialog.CloseTrigger :class="buttonClass" v-bind="{ ...$attrs, class: undefined }">
    <slot />
  </ArkDialog.CloseTrigger>
</template>
