<script lang="ts">
  import { Item, ItemGroup } from "@ui-organized/svelte";
  // Two fixed rows; see cases/ItemGroup.tsx.
  let { itemVariant, ...props }: Record<string, any> = $props();
</script>

<ItemGroup {...(props as any)}>
  <Item variant={itemVariant} title="Product updates" description="News about releases." />
  <Item variant={itemVariant} title="Weekly digest" href="/digest" />
</ItemGroup>
