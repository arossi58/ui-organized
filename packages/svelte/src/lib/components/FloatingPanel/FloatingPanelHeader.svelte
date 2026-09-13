<!--
  The panel's title bar. Wraps its children in the drag handle, so grabbing the
  header is what moves the panel — which is why the title and close button go
  inside this part rather than straight into the content.
-->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FloatingPanelHeaderProps } from "./FloatingPanel.types.js";

  let { class: className, children, ...rest }: FloatingPanelHeaderProps = $props();
</script>

<ArkFloatingPanel.Header class={clsx("floating-panel__header", className)} {...rest}>
  <ArkFloatingPanel.DragTrigger class="floating-panel__drag">
    {@render children?.()}
  </ArkFloatingPanel.DragTrigger>
</ArkFloatingPanel.Header>
