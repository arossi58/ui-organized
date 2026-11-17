<!--
  Puts the chosen option's label in the box once the options holding it arrive.
  Renders nothing.

  zag works out the input text once, when the machine starts, as
  `collection.stringifyMany(value)`. A value set before its options have loaded
  therefore gives an empty box showing the placeholder over a perfectly good
  selection. When the options do arrive the machine sends `CHILDREN_CHANGE`,
  which only its open states handle, and the value has not changed, so its own
  value watcher stays quiet too. Nothing re-derives the text.
  `syncSelectedItems` is zag's public way to ask for exactly that.

  Keyed on the *label*, not on `options`. A list rebuilt on every render, or
  refetched as the user types, gives a new array each time; re-syncing on that
  would wipe whatever they were halfway through typing. A watched string only
  fires when it changes, so this runs when the label goes from `undefined` to
  the string, and that is the moment worth acting on.

  And only into an empty, closed box. Open means someone is using it, and text
  in a closed box was put there by the machine or the user, never by the
  missing option. Resolved against `options` rather than the machine's
  collection, which is narrowed by the query. With the box empty the query is
  too, so the collection zag syncs from is the whole list.

  Split out because the machine is only reachable below `Combobox.Root`, the
  same reason `SelectTrigger` is its own component. React's is
  `SelectedLabelSync` in Combobox.tsx.
-->
<script setup lang="ts">
import { computed, watch } from "vue";
import { useComboboxContext } from "@ark-ui/vue";
import type { ComboboxOption } from "./Combobox.types.js";

const props = defineProps<{ options: ComboboxOption[] }>();
const combobox = useComboboxContext();

const label = computed(() => {
  const chosen = combobox.value.value[0];
  return chosen == null ? undefined : props.options.find((o) => o.value === chosen)?.label;
});

watch(label, (resolved) => {
  const { open, inputValue, syncSelectedItems } = combobox.value;
  if (!resolved || open || inputValue !== "") return;
  syncSelectedItems();
});
</script>

<template>
  <!-- Renders nothing; see above. -->
</template>
