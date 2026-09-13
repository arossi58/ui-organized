<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { ContextMenuGroupProps } from "./ContextMenu.types.js";

  let { class: className, children, ...rest }: ContextMenuGroupProps = $props();
</script>

<ArkMenu.ItemGroup class={clsx("context-menu__group", className)} {...rest}>
  {@render children?.()}
</ArkMenu.ItemGroup>
