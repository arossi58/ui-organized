<!-- Heading for the panel, and the thing that names it. Ark renders an <h2> in every version here. -->
<script lang="ts">
  import { Drawer as ArkDrawer } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { DRAWER_CLASS } from "@ui-organized/core";
  import type { DrawerTitleProps } from "./Drawer.types.js";

  let { class: className, children, ...rest }: DrawerTitleProps = $props();
</script>

<ArkDrawer.Title class={clsx(DRAWER_CLASS.title, className)} {...rest}>
  {@render children?.()}
</ArkDrawer.Title>
