<!--
  One page in a sidebar. Give it children (`NavSubItem`s) to make it expandable.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { navItemStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { useNavContext } from "./navContext.js";
  import type { NavItemProps } from "./Navigation.types.js";
  import "@ui-organized/core/components/Navigation/Navigation.css";

  const ICON_SIZE = 18;
  const CARET_SIZE = 20;

  let {
    label,
    icon,
    selected = false,
    collapsed,
    disabled,
    children,
    expanded = $bindable(),
    defaultExpanded = false,
    onExpandedChange,
    class: className,
    onclick,
    ...rest
  }: NavItemProps = $props();

  const nav = useNavContext();
  // `??`, not `||`: an explicit `false` overrides the rail rather than inheriting it.
  const isCollapsed = $derived(collapsed ?? nav.collapsed);

  // React can inspect its children and treat `false` as absent; a Svelte snippet
  // is opaque, so "no sub-items" is spelled the only way it can be — the snippet
  // was never passed. The same rule Button and Toggle use for their labels.
  const expandable = $derived(children !== undefined);
  // An icon-only rail has no room for an inline sub-list, so suppress it.
  const showSubList = $derived(expandable && !isCollapsed);

  // `expanded` is bindable so `bind:expanded` works the way a Svelte consumer
  // expects, and `onExpandedChange` is kept alongside it so the API still
  // matches the React package — the same pair `Collapsible` exposes.
  // `defaultExpanded` only seeds the uncontrolled case, so it lives in its own
  // state rather than in the bindable's fallback.
  // svelte-ignore state_referenced_locally -- reading the initial value is the
  // point: it is a *default*, not a binding, and re-seeding from it later would
  // slam an item shut the moment the parent re-rendered.
  let internalExpanded = $state(defaultExpanded);
  const isExpanded = $derived(expanded ?? internalExpanded);
  const subListId = $props.id();

  const handleClick = (event: MouseEvent & { currentTarget: HTMLButtonElement }) => {
    if (showSubList) {
      const next = !isExpanded;
      // Both: the local seed for a caller who passed only `defaultExpanded`, and
      // the bindable for one who wrote `bind:expanded`.
      internalExpanded = next;
      expanded = next;
      onExpandedChange?.(next);
    }
    onclick?.(event);
  };
</script>

<div
  class={clsx(
    "nav-item",
    isCollapsed && "nav-item--collapsed",
    showSubList && isExpanded && "nav-item--expanded",
    className,
  )}
>
  <button
    type="button"
    class={clsx(
      "text-default-body-medium",
      navItemStyles({ selected, expandable: showSubList }),
    )}
    {disabled}
    aria-current={selected ? "page" : undefined}
    aria-expanded={showSubList ? isExpanded : undefined}
    aria-controls={showSubList ? subListId : undefined}
    title={isCollapsed && typeof label === "string" ? label : undefined}
    onclick={handleClick}
    {...rest}
  >
    <span class="nav-item__content">
      {#if icon}
        <Icon name={icon} size={ICON_SIZE} class="nav-item__icon" />
      {/if}
      <span class="nav-item__label">
        {#if typeof label === "string"}{label}{:else}{@render label()}{/if}
      </span>
    </span>
    {#if showSubList}
      <Icon
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={CARET_SIZE}
        class="nav-item__caret"
      />
    {/if}
  </button>
  {#if showSubList}
    <!--
      `role="group"`, not `list`: the sub-items are buttons, and a list may only
      contain listitems — the mismatch is an ARIA error. What the panel actually
      is here is the disclosure the button above expands.
    -->
    <div id={subListId} class="nav-item__sub-list" role="group">
      <div class="nav-item__sub-list-inner">{@render children?.()}</div>
    </div>
  {/if}
</div>
