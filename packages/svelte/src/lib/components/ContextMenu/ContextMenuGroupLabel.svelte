<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { ContextMenuGroupLabelProps } from "./ContextMenu.types.js";

  let { class: className, children, ...rest }: ContextMenuGroupLabelProps = $props();
</script>

<ArkMenu.ItemGroupLabel
  class={clsx("context-menu__group-label", "text-strong-body-small", className)}
  {...rest}
>
  {@render children?.()}
</ArkMenu.ItemGroupLabel>
