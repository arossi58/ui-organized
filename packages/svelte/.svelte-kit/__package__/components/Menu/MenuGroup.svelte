<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { MenuGroupProps } from "./Menu.types.js";

  let { class: className, children, ...rest }: MenuGroupProps = $props();
</script>

<ArkMenu.ItemGroup class={clsx("menu__group", className)} {...rest}>
  {@render children?.()}
</ArkMenu.ItemGroup>
