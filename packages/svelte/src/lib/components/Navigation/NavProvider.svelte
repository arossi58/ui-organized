<!--
  Shares sidebar-level state with every NavItem / NavSubItem below it, so a
  single toggle drives the whole rail without prop drilling.

  `Sidebar` provides this itself; reach for the bare provider only when building
  a container of your own.
-->
<script lang="ts">
  import { setNavContext } from "./navContext.js";
  import type { NavProviderProps } from "./Navigation.types.js";

  let { collapsed = false, children }: NavProviderProps = $props();

  // A getter rather than a snapshot: see ./navContext.ts.
  setNavContext({
    get current() {
      return { collapsed };
    },
  });
</script>

{@render children?.()}
