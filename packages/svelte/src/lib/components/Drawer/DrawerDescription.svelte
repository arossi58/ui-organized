<!-- Supporting copy under the title; becomes the drawer's description. Ark renders a <div> in every version here. -->
<script lang="ts">
  import { Drawer as ArkDrawer } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { DRAWER_CLASS } from "@ui-organized/core";
  import type { DrawerDescriptionProps } from "./Drawer.types.js";

  let { class: className, children, ...rest }: DrawerDescriptionProps = $props();
</script>

<ArkDrawer.Description class={clsx(DRAWER_CLASS.description, className)} {...rest}>
  {@render children?.()}
</ArkDrawer.Description>
