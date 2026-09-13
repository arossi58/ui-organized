<!--
  The sidebar shell: a logo region, a scrollable nav landmark, and a footer that
  can carry the collapse toggle.

  Ark UI has no Navigation primitive, so everything here — the landmark, the
  controlled/uncontrolled collapse, the rail shared with descendants — is the
  facade's own.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import { setNavContext } from "./navContext.js";
  import type { SidebarProps } from "./Navigation.types.js";
  import "@ui-organized/core/components/Navigation/Navigation.css";

  const TOGGLE_ICON_SIZE = 20;

  let {
    logo,
    logoCollapsed,
    footer,
    children,
    navLabel = "Primary",
    collapsible = false,
    collapsed = $bindable(),
    defaultCollapsed = false,
    onCollapsedChange,
    class: className,
    ...rest
  }: SidebarProps = $props();

  // `collapsed` is bindable so `bind:collapsed` works the way a Svelte consumer
  // expects, with `onCollapsedChange` kept alongside to match the React package.
  // `defaultCollapsed` seeds the uncontrolled case only.
  // svelte-ignore state_referenced_locally -- see NavItem.svelte: a default is
  // read once on purpose.
  let internalCollapsed = $state(defaultCollapsed);
  const isCollapsed = $derived(collapsed ?? internalCollapsed);

  // A getter, not a snapshot: a descendant reading this after the toggle runs
  // has to see the new value. See ./navContext.ts.
  setNavContext({
    get current() {
      return { collapsed: isCollapsed };
    },
  });

  const toggle = () => {
    const next = !isCollapsed;
    internalCollapsed = next;
    collapsed = next;
    onCollapsedChange?.(next);
  };

  const hasLogo = $derived(logo != null || logoCollapsed != null);
  const showFooter = $derived(footer != null || collapsible);
  // A rail has room for a mark but not a wordmark; fall back when there is no
  // compact one.
  const shownLogo = $derived(isCollapsed ? (logoCollapsed ?? logo) : logo);
</script>

<div class={clsx("sidebar", isCollapsed && "sidebar--collapsed", className)} {...rest}>
  {#if hasLogo}
    <div class="sidebar__logo">
      {#if typeof shownLogo === "string"}{shownLogo}{:else}{@render shownLogo?.()}{/if}
    </div>
  {/if}

  <nav class="sidebar__nav" aria-label={navLabel}>
    {@render children?.()}
  </nav>

  {#if showFooter}
    <div class="sidebar__footer">
      {#if footer != null}
        <div class="sidebar__footer-content">
          {#if typeof footer === "string"}{footer}{:else}{@render footer()}{/if}
        </div>
      {/if}
      {#if collapsible}
        <button
          type="button"
          class="sidebar__toggle text-default-body-medium"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand" : "Collapse"}
          onclick={toggle}
        >
          <Icon
            name={isCollapsed ? "chevron-right" : "chevron-left"}
            size={TOGGLE_ICON_SIZE}
            class="sidebar__toggle-icon"
          />
          <span class="sidebar__toggle-label">{isCollapsed ? "Expand" : "Collapse"}</span>
        </button>
      {/if}
    </div>
  {/if}
</div>
