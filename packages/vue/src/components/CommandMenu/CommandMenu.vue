<!--
  A search box over a list of commands, in a dialog near the top of the
  screen. Typing narrows the list and highlights its first command; the arrows
  move through it, wrapping at the ends; Enter or a click runs one. Built from
  Dialog and Ark's Listbox, as React's CommandMenu is, with the same markup.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Listbox as ArkListbox, createListCollection } from "@ark-ui/vue";
import {
  createContains,
  detectPlatform,
  filterCommandItems,
  firstCommand,
  groupCommandItems,
  matchesHotkey,
  orderCommandItems,
} from "@ui-organized/core";
import Dialog from "../Dialog/Dialog.vue";
import DialogContent from "../Dialog/DialogContent.vue";
import Icon from "../Icon/Icon.vue";
import Kbd from "../Kbd/Kbd.vue";
import type { CommandMenuItem, CommandMenuProps } from "./CommandMenu.types.js";
import "@ui-organized/core/components/CommandMenu/CommandMenu.css";
import { glyph } from "../../icons/glyph.js";

const props = withDefaults(defineProps<CommandMenuProps>(), {
  open: undefined,
  defaultOpen: undefined,
  closeOnSelect: true,
  placeholder: "Type a command or search…",
  emptyMessage: "No results found.",
  label: "Command menu",
});
const emit = defineEmits<{
  "update:open": [open: boolean];
  openChange: [open: boolean];
  select: [value: string];
}>();

/** Built once: the collator is the expensive part of a comparison. */
const contains = createContains();

const ownOpen = ref(props.defaultOpen ?? false);
const isOpen = computed(() => props.open ?? ownOpen.value);
function setOpen(next: boolean) {
  if (props.open === undefined) ownOpen.value = next;
  emit("update:open", next);
  emit("openChange", next);
}

const query = ref("");
const input = ref<{ $el?: HTMLInputElement } | null>(null);
// zag focuses the list on a row's mousedown; focus goes back to the search box.
function keepFocusInInput() {
  input.value?.$el?.focus({ preventScroll: true });
}
// A menu reopened starts from the whole list, not the last search.
watch(isOpen, (open) => {
  if (!open) query.value = "";
});

const matches = computed(() => orderCommandItems(filterCommandItems(props.items, query.value, contains)));
const groups = computed(() => groupCommandItems(matches.value));

/**
 * Derived rather than set in a watcher, so it is valid for the list being
 * drawn: see React's CommandMenu. A row the pointer or the arrows moved to is
 * kept until the query changes.
 */
const moved = ref<{ query: string; value: string } | null>(null);
const highlighted = computed(() => {
  const m = moved.value;
  return m && m.query === query.value && matches.value.some((item) => item.value === m.value)
    ? m.value
    : firstCommand(matches.value);
});
function onHighlightChange(details: { highlightedValue: string | null }) {
  // zag clears the highlight when the pointer leaves a row; the menu keeps it.
  if (details.highlightedValue != null) moved.value = { query: query.value, value: details.highlightedValue };
}
function onRun(details: { value: string }) {
  emit("select", details.value);
  if (props.closeOnSelect) setOpen(false);
}

const collection = computed(() =>
  createListCollection<CommandMenuItem>({
    items: matches.value,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    isItemDisabled: (item) => !!item.disabled,
  }),
);

function onKeyDown(event: KeyboardEvent) {
  if (!props.hotkey || event.defaultPrevented || event.repeat) return;
  if (!matchesHotkey(event, props.hotkey, detectPlatform())) return;
  event.preventDefault();
  setOpen(!isOpen.value);
}
watch(
  () => props.hotkey,
  (hotkey, _, onCleanup) => {
    if (!hotkey || typeof document === "undefined") return;
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  },
  { immediate: true },
);
onBeforeUnmount(() => typeof document !== "undefined" && document.removeEventListener("keydown", onKeyDown));
</script>

<template>
  <Dialog :open="isOpen" @open-change="setOpen">
    <DialogContent :show-close="false" :container="portalContainer" class="command-menu" :aria-label="label">
      <ArkListbox.Root
        class="command-menu__listbox"
        :collection="collection"
        :model-value="[]"
        :highlighted-value="highlighted ?? undefined"
        :loop-focus="true"
        :typeahead="false"
        @highlight-change="onHighlightChange"
        @select="onRun"
      >
        <ArkListbox.Label class="command-menu__label">{{ label }}</ArkListbox.Label>
        <div class="command-menu__search">
          <Icon :name="glyph('search')" :size="20" />
          <ArkListbox.Input
            ref="input"
            class="command-menu__input"
            role="combobox"
            aria-expanded="true"
            :aria-label="label"
            :placeholder="placeholder"
            :value="query"
            @input="(event: Event) => (query = (event.target as HTMLInputElement).value)"
          />
        </div>
        <ArkListbox.Content class="command-menu__list" :tabindex="-1" @focus="keepFocusInInput">
          <template v-for="[group, bucket] in groups" :key="group ?? ''">
            <template v-if="group == null">
              <ArkListbox.Item v-for="item in bucket" :key="item.value" :item="item" highlight-on-hover class="command-menu__item" :data-highlighted="item.value === highlighted ? '' : undefined">
                <span v-if="item.icon != null" class="command-menu__item-icon" aria-hidden="true"><Icon :name="item.icon" :size="16" /></span>
                <ArkListbox.ItemText as-child :data-highlighted="item.value === highlighted ? '' : undefined"><div class="command-menu__item-text">{{ item.label }}</div></ArkListbox.ItemText>
                <Kbd v-if="item.shortcut" :keys="item.shortcut" size="sm" :platform="platform" />
              </ArkListbox.Item>
            </template>
            <ArkListbox.ItemGroup v-else class="command-menu__group">
              <ArkListbox.ItemGroupLabel class="command-menu__group-label">{{ group }}</ArkListbox.ItemGroupLabel>
              <ArkListbox.Item v-for="item in bucket" :key="item.value" :item="item" highlight-on-hover class="command-menu__item" :data-highlighted="item.value === highlighted ? '' : undefined">
                <span v-if="item.icon != null" class="command-menu__item-icon" aria-hidden="true"><Icon :name="item.icon" :size="16" /></span>
                <ArkListbox.ItemText as-child :data-highlighted="item.value === highlighted ? '' : undefined"><div class="command-menu__item-text">{{ item.label }}</div></ArkListbox.ItemText>
                <Kbd v-if="item.shortcut" :keys="item.shortcut" size="sm" :platform="platform" />
              </ArkListbox.Item>
            </ArkListbox.ItemGroup>
          </template>
          <div v-if="matches.length === 0" role="option" aria-disabled="true" aria-selected="false" class="command-menu__empty">{{ emptyMessage }}</div>
        </ArkListbox.Content>
      </ArkListbox.Root>
    </DialogContent>
  </Dialog>
</template>
