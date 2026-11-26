<!-- The bar across the top of an AppShell: mark, navigation and controls, led by the menu button in the sheet layout. -->
<script lang="ts">
  import { getContext } from "svelte";
  import { clsx } from "clsx";
  import { APP_HEADER_CLASS, APP_HEADER_MENU_ICON_SIZE } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import SheetTrigger from "../Sheet/SheetTrigger.svelte";
  import { glyph } from "../../icons/glyph.js";
  import { APP_SHELL_KEY, type AppShellContextValue } from "./context.js";
  import type { AppHeaderProps } from "./AppShell.types.js";
  import "@ui-organized/core/components/Button/Button.css";
  import "@ui-organized/core/components/AppShell/AppShell.css";

  let {
    logo,
    nav,
    actions,
    menuLabel = "Open navigation",
    class: className,
    ...rest
  }: AppHeaderProps = $props();

  const shell = getContext<AppShellContextValue | undefined>(APP_SHELL_KEY);
  const inSheet = $derived(shell?.layout === "sheet");
  const showMenu = $derived(inSheet && !!shell?.hasSidebar);
</script>

<header class={clsx(APP_HEADER_CLASS.root, className)} {...rest}>
  {#if showMenu || logo}
    <div class={APP_HEADER_CLASS.start}>
      {#if showMenu}
        <SheetTrigger class={APP_HEADER_CLASS.menu} aria-label={menuLabel}
          ><Icon name={glyph("menu")} size={APP_HEADER_MENU_ICON_SIZE} /></SheetTrigger
        >
      {/if}
      {#if logo}
        <div class={APP_HEADER_CLASS.logo}>{@render logo()}</div>
      {/if}
    </div>
  {/if}
  {#if nav && !inSheet}
    <div class={APP_HEADER_CLASS.nav}>{@render nav()}</div>
  {/if}
  {#if actions}
    <div class={APP_HEADER_CLASS.actions}>{@render actions()}</div>
  {/if}
</header>
