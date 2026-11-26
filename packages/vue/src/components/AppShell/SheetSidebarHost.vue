<!--
  Around the sidebar in an AppShell's sheet, and only there: tells it it is in a
  sheet (expanded, no toggle) and how to close it on a click that navigates. A
  component of its own so the rail's copy of the sidebar does not inherit it.
-->
<script setup lang="ts">
import { provideSidebarHost } from "../Navigation/navContext.js";

const props = defineProps<{ onNavigate: () => void }>();
provideSidebarHost({ inSheet: true, onNavigate: () => props.onNavigate() });
</script>

<template><slot /></template>
