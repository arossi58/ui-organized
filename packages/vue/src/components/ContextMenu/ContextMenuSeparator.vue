<!--
  Renders the design-system Divider as the separator surface.

  The React library hands Ark's `Menu.Separator` an `asChild` child and lets it
  merge its semantics onto the Divider. That cannot work here. Ark Vue's
  separator renders `ark.hr` with `null` children, so the slot never reaches the
  polymorphic wrapper and `asChild` renders an empty comment — the menu simply
  loses its separator, with no warning and no element to notice. See
  ../Menu/MenuSeparator.vue, where the same trap was found first.

  So the props are taken from the menu context and put on the Divider directly:
  same rendered element, same `data-scope`/`data-part`, nothing depending on a
  slot Ark does not forward.
-->
<script setup lang="ts">
import { computed } from "vue";
import { useMenuContext } from "@ark-ui/vue";
import Divider from "../Divider/Divider.vue";

const menu = useMenuContext();
const separatorProps = computed(() => menu.value.getSeparatorProps());
</script>

<template>
  <Divider v-bind="separatorProps" class="context-menu__separator" />
</template>
