<script setup lang="ts">
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@ui-organized/vue";
// `items` describes the tree; see cases/NavigationMenu.tsx.
defineProps<{ items: Array<Record<string, any>> }>();
const rest = (item: Record<string, any>) => {
  const { links: _links, router: _router, ...props } = item;
  return props;
};
const linkProps = (link: Record<string, any>) => {
  const { title: _title, ...props } = link;
  return props;
};
</script>

<template>
  <NavigationMenu v-bind="$attrs as any">
    <template v-for="item in items" :key="item.value">
      <NavigationMenuItem v-if="item.router" :value="item.value">
        <NavigationMenuLink as="a" href="/router">{{ item.label }}</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem v-else v-bind="rest(item) as any">
        <NavigationMenuLink
          v-for="link in item.links ?? []"
          :key="link.href"
          v-bind="linkProps(link)"
          >{{ link.title }}</NavigationMenuLink
        >
      </NavigationMenuItem>
    </template>
  </NavigationMenu>
</template>
