<script lang="ts">
  import { Pagination } from "@ui-organized/svelte";

  // No callback to supply: `onPageChange` is optional here because `bind:page`
  // does the same job, and neither reaches the DOM.
  let { ...props }: Record<string, any> = $props();
</script>

<Pagination {...props} />
