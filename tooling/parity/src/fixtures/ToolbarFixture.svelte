<script lang="ts">
  import { Button, Divider, Toolbar, ToolbarGroup } from "@ui-organized/svelte";

  let { ...props }: Record<string, any> = $props();
</script>

<Toolbar {...props}>
  <ToolbarGroup>
    <Button intent="ghost" size="sm">Bold</Button>
    <Button intent="ghost" size="sm">Italic</Button>
  </ToolbarGroup>
  <Divider orientation="vertical" />
  <Button intent="ghost" size="sm">Link</Button>
</Toolbar>
