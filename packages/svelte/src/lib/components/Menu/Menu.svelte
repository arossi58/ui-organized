<!--
  Menu root — controls open state.

  Unlike the React package this does not integrate with Menubar: Menubar is not
  part of the Svelte tier-1 set, so the trigger never needs to become one of a
  bar's menuitems. When Menubar lands, the trigger gains the same role and
  data-menubar-item treatment.
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
