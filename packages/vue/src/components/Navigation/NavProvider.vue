<!--
  Shares sidebar-level state with every NavItem / NavSubItem below it, so a
  single toggle drives the whole rail without prop drilling.

  `Sidebar` provides this itself; reach for the bare provider only when building
  a container of your own.
-->
<script setup lang="ts">
import { computed } from "vue";
import { provideNavContext } from "./navContext.js";
import type { NavProviderProps } from "./Navigation.types.js";

const props = withDefaults(defineProps<NavProviderProps>(), { collapsed: false });

// A computed rather than a snapshot: see ./navContext.ts.
provideNavContext(computed(() => ({ collapsed: props.collapsed })));
</script>

<template>
  <slot />
</template>
