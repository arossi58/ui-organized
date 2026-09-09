<script lang="ts">
  import { NavItem, NavSubItem, Sidebar } from "@ui-organized/svelte";

  // `logo` and `footer` need no translation: Svelte takes them as
  // `string | Snippet`, so the case's strings reach the component as written.
  // `itemProps` is applied to the expandable item so a case can open it.
  let { itemProps = {}, ...props }: Record<string, any> = $props();
</script>

<Sidebar {...props}>
  <NavItem label="Home" icon="check" selected />
  <NavItem label="Reports" icon="check" {...itemProps}>
    <NavSubItem label="Weekly" />
    <NavSubItem label="Monthly" selected />
  </NavItem>
</Sidebar>
