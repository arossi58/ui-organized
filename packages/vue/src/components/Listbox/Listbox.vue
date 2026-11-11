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

/**
 * zag's listbox focuses its content on every item `mousedown`, and calls
 * `focus()` without `preventScroll`. Inside any scroll container where the
 * list's top is out of view — a bottom sheet scrolled down to the option the
 * user wants — that focus scrolls the list's top into view between press and
 * release, so the release lands on a different option and the tap selects the
 * wrong thing or nothing.
 *
 * So the content is focused first, in the capture phase, without scrolling.
 * By the time zag's own handler runs the element already has focus, and
 * focusing the focused element is a no-op — including its scroll. The pressed
 * option is already on screen, which is how it got pressed.
 */
function focusWithoutScrolling(event: MouseEvent) {
  const content = event.currentTarget as HTMLElement;
  if (document.activeElement !== content) content.focus({ preventScroll: true });
}

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
    <ArkListbox.Content class="listbox__content" @mousedown.capture="focusWithoutScrolling">
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
      <!-- A `listbox` must own `option` or `group` children, and with no items it
           had neither — axe rates that critical, because a screen reader entering
           the list is told it is a listbox and then finds nothing in it. A
           disabled option is the conventional answer: the list is never childless,
           and what the user hears ("No results, dimmed") is true.

           Written out rather than using `ArkListbox.Empty`, which hard-codes
           `role="presentation"` and ignores a `role` prop — the element it
           produces is exactly the child the rule rejects. Same reasoning, and same
           markup, as the React library. -->
      <div
        v-if="props.options.length === 0"
        role="option"
        aria-disabled="true"
        aria-selected="false"
        class="listbox__empty"
      >
        {{ emptyMessage }}
      </div>
    </ArkListbox.Content>
  </ArkListbox.Root>
</template>
