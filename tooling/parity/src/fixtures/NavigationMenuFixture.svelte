<script lang="ts">
  import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@ui-organized/svelte";
  // `items` describes the tree; see cases/NavigationMenu.tsx.
  let { items, ...props }: Record<string, any> = $props();
</script>

<NavigationMenu {...props}>
  {#each items as { links, router, ...item } (item.value)}
    {#if router}
      <NavigationMenuItem value={item.value}>
        <NavigationMenuLink href="/router">{item.label}</NavigationMenuLink>
      </NavigationMenuItem>
    {:else}
      <NavigationMenuItem {...item}>
        {#each links ?? [] as { title, ...link } (link.href)}
          <NavigationMenuLink {...link}>{title}</NavigationMenuLink>
        {/each}
      </NavigationMenuItem>
    {/if}
  {/each}
</NavigationMenu>
