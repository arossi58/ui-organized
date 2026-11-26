<script setup lang="ts">
import { Item } from "@ui-organized/vue";
// `media`, `actions` and `router` stand for slot content; see cases/Item.tsx.
defineProps<{ media?: boolean; actions?: boolean; router?: boolean }>();
</script>

<template>
  <Item v-bind="$attrs as any" :link-as="router ? 'a' : undefined" :link-props="router ? { href: '/router' } : undefined">
    <template v-if="media" #media><span class="parity-media">AB</span></template>
    <template v-if="actions" #actions><button type="button">Edit</button></template>
  </Item>
</template>
