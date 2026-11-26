<!--
  Around the sidebar in an AppShell's sheet, and only there: tells it it is in a
  sheet (expanded, no toggle) and how to close it on a click that navigates.
  A component of its own because context belongs to the component that renders
  the snippet, and the rail's copy of the sidebar must not get it.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { setSidebarHost } from "../Navigation/navContext.js";

  let { onNavigate, children }: { onNavigate: () => void; children?: Snippet } = $props();

  setSidebarHost({
    inSheet: true,
    onNavigate: () => onNavigate(),
  });
</script>

{@render children?.()}
