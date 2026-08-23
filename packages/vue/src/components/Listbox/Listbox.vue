<!--
  A standing list of options — the always-visible sibling of Select. Nothing is
  portalled here, so the whole component is one subtree.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Listbox as ArkListbox, createListCollection } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, listboxStyles, type ControlSize } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import ListboxOptions from "./ListboxOptions.vue";
import type { ListboxProps, ListboxOption } from "./Listbox.types.js";
import "@ui-organized/core/components/Listbox/Listbox.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<ListboxProps>(), {
  size: "md",
  emptyMessage: "No options",
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
}>();

const attrs = useAttrs();
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size as ControlSize]);
const rootClass = computed(() =>
  clsx(listboxStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// Ark drives the list off a collection rather than children, the same way Select
// does — `options` is the single source for both.
const collection = computed(() =>
  createListCollection({
    items: props.options,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    isItemDisabled: (item) => !!item.disabled,
  }),
);

/**
 * Options in declaration order, bucketed by `group`. Ungrouped options keep a
 * `null` bucket so a partially grouped list still renders every option once, in
 * the order it was given.
 */
const groups = computed<[string | null, ListboxOption[]][]>(() => {
  const buckets = new Map<string | null, ListboxOption[]>();
  for (const option of props.options) {
    const key = option.group ?? null;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(option);
    else buckets.set(key, [option]);
  }
  return [...buckets];
});

const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    selectionMode: props.selectionMode,
    disabled: props.disabled,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: string[] }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
</script>

<template>
  <!--
    One `v-bind` object, not two: an element may carry only one argument-less
    v-bind, and a second is a compile error rather than a merge. `$attrs` comes
    last so a caller can still override, and `class` is nulled out of it because
    `:class` above has already folded it into the recipe.
  -->
  <ArkListbox.Root
    :class="rootClass"
    :collection="collection"
    v-bind="{ ...rootProps, ...$attrs, class: undefined }"
    @value-change="onValueChange"
  >
    <ArkListbox.Label v-if="label" class="listbox__label">{{ label }}</ArkListbox.Label>
    <ArkListbox.Content class="listbox__content">
      <template v-for="([group, groupItems], index) in groups" :key="index">
        <ArkListbox.ItemGroup v-if="group != null" class="listbox__group">
          <ArkListbox.ItemGroupLabel class="listbox__group-label">
            {{ group }}
          </ArkListbox.ItemGroupLabel>
          <ListboxOptions :items="groupItems" :icon-size="iconSize" />
        </ArkListbox.ItemGroup>
        <!--
          An ungrouped bucket must not be wrapped in an ItemGroup — that would
          announce a group with no name to a screen reader.
        -->
        <ListboxOptions v-else :items="groupItems" :icon-size="iconSize" />
      </template>
      <ArkListbox.Empty class="listbox__empty">{{ emptyMessage }}</ArkListbox.Empty>
    </ArkListbox.Content>
  </ArkListbox.Root>
</template>
