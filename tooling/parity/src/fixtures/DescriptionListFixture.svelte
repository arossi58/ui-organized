<script lang="ts">
  import { DescriptionList, DescriptionListItem } from "@ui-organized/svelte";
  // `composed` stands for DescriptionListItem children; see cases/DescriptionList.tsx.
  let { composed, ...props }: Record<string, any> = $props();
</script>

<DescriptionList {...(props as any)}>
  {#if composed}
    <DescriptionListItem term="Owner">Ada Lovelace</DescriptionListItem>
    <DescriptionListItem term="Region">Europe (west)</DescriptionListItem>
  {/if}
</DescriptionList>
