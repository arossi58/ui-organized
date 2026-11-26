<script lang="ts">
  import { Item } from "@ui-organized/svelte";
  // `media`, `actions` and `router` stand for slot content; see cases/Item.tsx.
  let { media, actions, router, ...props }: Record<string, any> = $props();
</script>

{#snippet mediaSnippet()}<span class="parity-media">AB</span>{/snippet}
{#snippet actionsSnippet()}<button type="button">Edit</button>{/snippet}

<Item
  {...(props as any)}
  href={router ? "/router" : props.href}
  media={media ? mediaSnippet : undefined}
  actions={actions ? actionsSnippet : undefined}
/>
