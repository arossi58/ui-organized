<!--
  Renders the design-system Divider as the menu's separator surface.

  The other two libraries hand Ark's `Menu.Separator` an `asChild` child and let
  it merge its semantics onto the Divider. That cannot work here. Ark Vue's
  separator renders `ark.hr`, `hr` is in the factory's self-closing-tag list, and
  a self-closing part is built with `null` children — so the slot never reaches
  the polymorphic wrapper and `asChild` renders nothing at all. The menu simply
  lost its separator, silently, with no warning and no empty element to notice.

  So the props are taken from the menu context and put on the Divider directly.
  Same rendered element, same `data-scope`/`data-part`, and nothing depending on
  a slot that Ark does not forward.
-->
<script setup lang="ts">
import { computed } from "vue";
import { useMenuContext } from "@ark-ui/vue";
import Divider from "../Divider/Divider.vue";

const menu = useMenuContext();
const separatorProps = computed(() => menu.value.getSeparatorProps());
</script>

<template>
  <Divider v-bind="separatorProps" class="menu__separator" />
</template>
