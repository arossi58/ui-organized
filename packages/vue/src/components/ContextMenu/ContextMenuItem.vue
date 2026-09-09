<script setup lang="ts">
import { computed, useId } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { ContextMenuItemProps } from "./ContextMenu.types.js";

// `disabled` defaults to `undefined` for the reason in ../../props.ts: Vue casts
// an absent Boolean prop to `false`, and forwarding that is a claim rather than
// a silence.
const props = withDefaults(defineProps<ContextMenuItemProps>(), { disabled: undefined });
const emit = defineEmits<{ select: [] }>();
// Ark requires a stable value per item; fall back to a generated id. Typeahead
// still uses the item's text content.
const generatedId = useId();
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
const itemClass = computed(() =>
  clsx("context-menu__item", props.destructive && "context-menu__item--destructive"),
);
</script>

<template>
  <ArkMenu.Item
    :value="value ?? generatedId"
    v-bind="itemProps"
    :class="itemClass"
    @select="emit('select')"
  >
    <Icon v-if="icon" :name="icon" :size="20" class="context-menu__item-icon" />
    <span class="context-menu__item-label"><slot /></span>
  </ArkMenu.Item>
</template>
