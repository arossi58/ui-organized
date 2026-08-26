<script lang="ts">
  import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<Menu {...props}>
  <MenuTrigger>Open</MenuTrigger>
  <MenuContent {...contentProps}>
    <MenuItem value="a">Cut</MenuItem>
    <MenuSeparator />
    <MenuItem value="b" destructive>Delete</MenuItem>
  </MenuContent>
</Menu>
