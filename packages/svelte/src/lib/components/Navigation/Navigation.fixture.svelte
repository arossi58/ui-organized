<!--
  A sidebar with its own collapse toggle and one item below it.

  The toggle has to be the real one rather than a prop the test flips, because
  what is under test is the trip from the container's state to a descendant that
  is already mounted — see ./navContext.ts.
-->
<script lang="ts">
  import NavItem from "./NavItem.svelte";
  import Sidebar from "./Sidebar.svelte";
</script>

<Sidebar collapsible>
  <NavItem label="Home" />
</Sidebar>
