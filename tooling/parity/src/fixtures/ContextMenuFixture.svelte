<script lang="ts">
  import {
    ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<ContextMenu {...props}>
  <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
  <ContextMenuContent {...contentProps}>
    <ContextMenuItem value="a">Cut</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem value="b" destructive>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
