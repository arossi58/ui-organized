<script lang="ts">
  import { Menu, MenuContent, MenuItem, MenuTrigger, Menubar } from "@ui-organized/svelte";

  let { ...props }: Record<string, any> = $props();
</script>

<Menubar {...props}>
  <Menu>
    <MenuTrigger class="menubar__trigger">File</MenuTrigger>
    <MenuContent><MenuItem value="new">New</MenuItem></MenuContent>
  </Menu>
  <Menu>
    <MenuTrigger class="menubar__trigger">Edit</MenuTrigger>
    <MenuContent><MenuItem value="undo">Undo</MenuItem></MenuContent>
  </Menu>
</Menubar>
