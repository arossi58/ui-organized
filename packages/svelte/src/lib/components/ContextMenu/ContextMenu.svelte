<!--
  ContextMenu root — controls open state.

  Ark has no separate context-menu primitive: it is a Menu with a ContextTrigger
  (right-click) that anchors the positioner at the cursor.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { providePositioning } from "../Popover/positioning.svelte.js";
  import type { ContextMenuProps } from "./ContextMenu.types.js";
  import "@ui-organized/core/components/ContextMenu/ContextMenu.css";
  // Reuse the design-system Checkbox / Radio control visuals inside menu items.
  import "@ui-organized/core/components/Checkbox/Checkbox.css";
  import "@ui-organized/core/components/Radio/Radio.css";

  let { open = $bindable(), defaultOpen, onOpenChange, children }: ContextMenuProps = $props();

  // No placement: the cursor anchor set by ContextTrigger drives it, and naming
  // a side here would pull the popup back to the trigger box instead.
  const positioning = providePositioning({ gutter: 4 });
</script>

<ArkMenu.Root
  {open}
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  positioning={positioning.read()}
>
  {@render children?.()}
</ArkMenu.Root>
