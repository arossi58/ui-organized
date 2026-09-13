<!-- Root — owns open state, drag and resize. Wrap a trigger and content. -->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import type { FloatingPanelProps } from "./FloatingPanel.types.js";
  import "@ui-organized/core/components/FloatingPanel/FloatingPanel.css";

  let {
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    draggable,
    resizable,
    defaultSize,
    minSize,
    maxSize,
    defaultPosition,
    strategy,
    children,
  }: FloatingPanelProps = $props();
</script>

<ArkFloatingPanel.Root
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {draggable}
  {resizable}
  {defaultSize}
  {minSize}
  {maxSize}
  {defaultPosition}
  {strategy}
>
  {@render children?.()}
</ArkFloatingPanel.Root>
