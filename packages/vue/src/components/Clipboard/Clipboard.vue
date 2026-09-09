<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Clipboard as ArkClipboard } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, clipboardStyles } from "@ui-organized/core";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import type { ClipboardProps } from "./Clipboard.types.js";
import "@ui-organized/core/components/Clipboard/Clipboard.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ClipboardProps>(), {
  variant: "input",
  size: "md",
  copyLabel: "Copy",
  copiedLabel: "Copied",
});
const emit = defineEmits<{ statusChange: [copied: boolean] }>();

const attrs = useAttrs();
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);
const rootClass = computed(() =>
  clsx(
    clipboardStyles({ size: props.size, variant: props.variant }),
    attrs.class as string,
  ),
);

/**
 * Ark Vue calls the copied text `modelValue`, not `value`.
 *
 * Its single-value props are named for `v-model`, so `:value="..."` would be an
 * unknown attribute on the root div and the machine would copy an empty string.
 * The facade keeps `value` so the API matches React and Svelte, and translates
 * here — the same rename Progress needs.
 */
const arkValue = computed(() => props.value);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onStatusChange(details: { copied: boolean }) {
  emit("statusChange", details.copied);
}
</script>

<template>
  <ArkClipboard.Root
    :class="rootClass"
    :model-value="arkValue"
    :timeout="timeout"
    @status-change="onStatusChange"
  >
    <ArkClipboard.Label v-if="label" class="field__label">{{ label }}</ArkClipboard.Label>
    <ArkClipboard.Control class="clipboard__control">
      <ArkClipboard.Input v-if="variant === 'input'" class="clipboard__input" />
      <!--
        The trigger *is* the library Button: Ark hands its props to whatever the
        `as-child` slot renders, so the copy control inherits every interactive
        token instead of restating them.
      -->
      <ArkClipboard.Trigger as-child>
        <Button intent="secondary" :size="size" type="button">
          <!--
            The trigger swaps both its icon and its label on copy. Indicator
            renders its `copied` slot in the copied state and its own children
            otherwise, so the swap costs no local state. The icon goes through an
            Indicator rather than the Button's `icon` prop because only the
            Indicator knows the state.
          -->
          <ArkClipboard.Indicator class="clipboard__indicator">
            <template #copied><Icon name="check" :size="iconSize" /></template>
            <Icon name="copy" :size="iconSize" />
          </ArkClipboard.Indicator>
          <ArkClipboard.Indicator>
            <template #copied>{{ copiedLabel }}</template>
            {{ copyLabel }}
          </ArkClipboard.Indicator>
        </Button>
      </ArkClipboard.Trigger>
    </ArkClipboard.Control>
    <span v-if="helperText" class="field__description">{{ helperText }}</span>
  </ArkClipboard.Root>
</template>
