<!-- Collapsible root — owns the open state of a single disclosure section. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Collapsible as ArkCollapsible } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import type { CollapsibleProps } from "./Collapsible.types.js";
import "@ui-organized/core/components/Collapsible/Collapsible.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `open: false` is "controlled and closed", which pins the
// panel shut for good. See ../../props.ts.
const props = withDefaults(defineProps<CollapsibleProps>(), {
  open: undefined,
  defaultOpen: undefined,
  disabled: undefined,
});
/**
 * `open` is a plain prop plus an `update:open` emit rather than `defineModel`,
 * because `defineModel` gives no way to declare the `undefined` default the rule
 * above needs. `v-model:open` still works: that is what it compiles to.
 */
const emit = defineEmits<{
  "update:open": [open: boolean];
  openChange: [open: boolean];
}>();

const attrs = useAttrs();
const rootClass = computed(() => clsx("collapsible", attrs.class as string));
const rootProps = computed(() =>
  definedOnly({
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
  }),
);
</script>

<template>
  <!--
    One `v-bind` object, not two: an element may carry only one argument-less
    v-bind. `$attrs` comes last so a caller can still override, and `class` is
    nulled out of it because `:class` has already folded it into the recipe.
  -->
  <ArkCollapsible.Root
    :class="rootClass"
    v-bind="{ ...rootProps, ...$attrs, class: undefined }"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <slot />
  </ArkCollapsible.Root>
</template>
