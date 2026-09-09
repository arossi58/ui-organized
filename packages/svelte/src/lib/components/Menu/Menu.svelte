<!--
  Menu root — controls open state.

  A menu placed inside a `Menubar` gives up its trigger's button role: see
  MenuTrigger.svelte and ../Menubar/menubarContext.ts. That travels on context
  rather than through here, so this root knows nothing about the bar and the two
  components need not import each other.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { providePositioning } from "../Popover/positioning.svelte.js";
  import type { MenuProps } from "./Menu.types.js";
  import "@ui-organized/core/components/Menu/Menu.css";
  // Reuse the design-system Checkbox / Radio control visuals inside menu items.
  import "@ui-organized/core/components/Checkbox/Checkbox.css";
  import "@ui-organized/core/components/Radio/Radio.css";

  let { open = $bindable(), defaultOpen, onOpenChange, children }: MenuProps = $props();

  const positioning = providePositioning({ placement: "bottom-start", gutter: 4 });
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
