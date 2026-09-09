<script lang="ts">
  import { ScrollArea } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<ScrollArea {...props}>
  <p>One</p>
  <p>Two</p>
  <p>Three</p>
  <p>Four</p>
  <p>Five</p>
</ScrollArea>
