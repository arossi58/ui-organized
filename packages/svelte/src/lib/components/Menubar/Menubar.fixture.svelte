<!--
  Two real menus in a bar.

  Plain buttons carrying `data-menubar-item` would exercise the roving tabindex
  without proving the half that puts the attribute there — the triggers are
  independent Ark machines the bar can only reach through the DOM, and whether
  they learn they are in a bar at all is the other thing under test.
-->
<script lang="ts">
  import Menu from "../Menu/Menu.svelte";
  import MenuContent from "../Menu/MenuContent.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuTrigger from "../Menu/MenuTrigger.svelte";
  import Menubar from "./Menubar.svelte";
</script>

<Menubar>
  <Menu>
    <MenuTrigger class="menubar__trigger">File</MenuTrigger>
    <MenuContent><MenuItem value="new">New</MenuItem></MenuContent>
  </Menu>
  <Menu>
    <MenuTrigger class="menubar__trigger">Edit</MenuTrigger>
    <MenuContent><MenuItem value="undo">Undo</MenuItem></MenuContent>
  </Menu>
</Menubar>
