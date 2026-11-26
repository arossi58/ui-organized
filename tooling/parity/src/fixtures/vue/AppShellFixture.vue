<script setup lang="ts">
import { AppShell, AppHeader, NavItem, Sidebar } from "@ui-organized/vue";
// `header` and `sidebar` stand for slot content; see cases/AppShell.tsx.
defineProps<{ header?: { logo?: boolean; nav?: boolean; actions?: boolean }; sidebar?: boolean }>();
</script>

<template>
  <AppShell v-bind="$attrs as any">
    <template v-if="header" #header>
      <AppHeader>
        <template v-if="header.logo" #logo><span class="parity-logo">Acme</span></template>
        <template v-if="header.nav" #nav><span class="parity-nav">Nav</span></template>
        <template v-if="header.actions" #actions><button type="button">Sign in</button></template>
      </AppHeader>
    </template>
    <template v-if="sidebar" #sidebar>
      <Sidebar>
        <NavItem label="Reports" />
        <NavItem label="Settings" />
      </Sidebar>
    </template>
    <p>Page</p>
  </AppShell>
</template>
