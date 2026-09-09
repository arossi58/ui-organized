<script setup lang="ts">
import { NavItem, NavSubItem, Sidebar } from "@ui-organized/vue";

// React takes the logo and footer as node props; Vue takes them as slots, so
// the fixture translates. Conditional templates, because a slot that is present
// but empty still counts as present and would render the regions React omits.
defineOptions({ inheritAttrs: false });
defineProps<{
  logo?: string;
  footer?: string;
  /** Applied to the expandable item, so a case can open it. */
  itemProps?: Record<string, unknown>;
}>();
</script>

<template>
  <Sidebar v-bind="$attrs">
    <template v-if="logo" #logo>{{ logo }}</template>
    <template v-if="footer" #footer>{{ footer }}</template>
    <NavItem label="Home" icon="check" selected />
    <NavItem label="Reports" icon="check" v-bind="itemProps">
      <NavSubItem label="Weekly" />
      <NavSubItem label="Monthly" selected />
    </NavItem>
  </Sidebar>
</template>
