<script lang="ts">
  import {
    Menu,
    MenuTrigger,
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuCheckboxItem,
    MenuRadioGroup,
    MenuRadioItem,
  } from "@ui-organized/svelte";

  // Held here for the same reason React's fixture holds it: the checkbox item
  // takes `checked` and reports changes rather than owning the state.
  let columns = $state<Record<string, boolean>>({ name: true, email: false });
  let direction = $state("asc");
</script>

<Menu>
  <MenuTrigger>Open</MenuTrigger>
  <MenuContent>
    <MenuGroup>
      <MenuGroupLabel>Columns</MenuGroupLabel>
      <MenuCheckboxItem
        value="name"
        checked={columns.name}
        onCheckedChange={(checked) => (columns.name = checked)}>Name</MenuCheckboxItem
      >
      <MenuCheckboxItem
        value="email"
        checked={columns.email}
        onCheckedChange={(checked) => (columns.email = checked)}>Email</MenuCheckboxItem
      >
    </MenuGroup>
    <MenuRadioGroup bind:value={direction}>
      <MenuGroupLabel>Direction</MenuGroupLabel>
      <MenuRadioItem value="asc">Ascending</MenuRadioItem>
      <MenuRadioItem value="desc">Descending</MenuRadioItem>
    </MenuRadioGroup>
  </MenuContent>
</Menu>
