<!-- A sub-page beneath an expandable `NavItem`. -->
<script lang="ts">
  import { clsx } from "clsx";
  import { navSubItemStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { useNavContext } from "./navContext.js";
  import type { NavSubItemProps } from "./Navigation.types.js";
  import "@ui-organized/core/components/Navigation/Navigation.css";

  const ICON_SIZE = 20;

  let {
    label,
    icon,
    selected = false,
    collapsed,
    disabled,
    class: className,
    ...rest
  }: NavSubItemProps = $props();

  const nav = useNavContext();
  // `??`, not `||`: an explicit `false` overrides the rail rather than inheriting it.
  const isCollapsed = $derived(collapsed ?? nav.collapsed);
</script>

<button
  type="button"
  class={clsx(
    "text-default-body-medium",
    navSubItemStyles({ selected }),
    isCollapsed && "nav-sub-item--collapsed",
    className,
  )}
  {disabled}
  aria-current={selected ? "page" : undefined}
  title={isCollapsed && typeof label === "string" ? label : undefined}
  {...rest}
>
  {#if icon}
    <Icon name={icon} size={ICON_SIZE} class="nav-sub-item__icon" />
  {/if}
  <span class="nav-sub-item__label">
    {#if typeof label === "string"}{label}{:else}{@render label()}{/if}
  </span>
</button>
