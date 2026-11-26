<!-- An application's frame: a header across the top, a sidebar down the side, and the page in a <main> beside it. React's AppShell renders the same markup. -->
<script lang="ts">
  import { setContext, untrack } from "svelte";
  import { clsx } from "clsx";
  import {
    APP_SHELL_BREAKPOINT,
    APP_SHELL_CLASS,
    appShellDataLayout,
    appShellNarrowQuery,
    appShellStyles,
    resolveAppShellLayout,
  } from "@ui-organized/core";
  import Sheet from "../Sheet/Sheet.svelte";
  import SheetContent from "../Sheet/SheetContent.svelte";
  import SheetTitle from "../Sheet/SheetTitle.svelte";
  import SheetSidebarHost from "./SheetSidebarHost.svelte";
  import { APP_SHELL_KEY, type AppShellContextValue } from "./context.js";
  import type { AppShellProps } from "./AppShell.types.js";
  import "@ui-organized/core/components/Button/Button.css";
  import "@ui-organized/core/components/AppShell/AppShell.css";

  let {
    header,
    sidebar,
    children,
    layout = "auto",
    breakpoint = APP_SHELL_BREAKPOINT,
    onLayoutChange,
    navOpen = $bindable(),
    defaultNavOpen = false,
    onNavOpenChange,
    navTitle = "Menu",
    scroll = "page",
    skipLinkLabel = "Skip to content",
    mainId,
    portalContainer,
    class: className,
    ...rest
  }: AppShellProps = $props();

  // Unknown until the page runs, so the server and the first render are a rail.
  let narrow = $state<boolean | undefined>(undefined);
  $effect(() => {
    if (layout !== "auto" || typeof window.matchMedia !== "function") {
      narrow = undefined;
      return;
    }
    const list = window.matchMedia(appShellNarrowQuery(breakpoint));
    const update = () => (narrow = list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  });
  const resolved = $derived(resolveAppShellLayout(layout, narrow));
  const dataLayout = $derived(appShellDataLayout(layout, narrow));
  const uid = $props.id();
  const generatedId = `app-shell-main-${uid}`;
  const main = $derived(mainId ?? generatedId);

  // svelte-ignore state_referenced_locally -- a default is read once on purpose.
  let innerOpen = $state(defaultNavOpen);
  const isOpen = $derived(navOpen ?? innerOpen);
  const setOpen = (next: boolean) => {
    if (navOpen === undefined) innerOpen = next;
    else navOpen = next;
    onNavOpenChange?.(next);
  };
  // Shut whenever the layout is a rail, so it is never unmounted open.
  const sheetOpen = $derived(resolved === "sheet" && isOpen);

  // Only a change from sheet to rail closes it: the first render of `auto` is
  // a rail before it has measured.
  let previousLayout: string | undefined;
  $effect(() => {
    const now = resolved;
    const was = previousLayout;
    previousLayout = now;
    if (was === "sheet" && now === "rail" && untrack(() => isOpen)) untrack(() => setOpen(false));
  });

  let reported: string | undefined;
  $effect(() => {
    const now = dataLayout;
    if (!now || now === reported) return;
    reported = now;
    untrack(() => onLayoutChange?.(now));
  });

  setContext<AppShellContextValue>(APP_SHELL_KEY, {
    get layout() {
      return resolved;
    },
    get hasSidebar() {
      return sidebar != null;
    },
  });
</script>

<Sheet open={sheetOpen} onOpenChange={setOpen}>
  <div class={clsx(appShellStyles({ scroll }), className)} data-layout={dataLayout} {...rest}>
    <a class={APP_SHELL_CLASS.skip} href={`#${main}`}>{skipLinkLabel}</a>
    {@render header?.()}
    <div class={APP_SHELL_CLASS.body}>
      {#if resolved === "rail" && sidebar}
        <div class={APP_SHELL_CLASS.sidebar}>{@render sidebar()}</div>
      {/if}
      <main id={main} class={APP_SHELL_CLASS.main} tabindex="-1">{@render children?.()}</main>
    </div>
    {#if resolved === "sheet" && sidebar}
      <SheetContent side="left" size="sm" class={APP_SHELL_CLASS.sheet} container={portalContainer}>
        <SheetTitle class={APP_SHELL_CLASS.sheetTitle}>{navTitle}</SheetTitle>
        <SheetSidebarHost onNavigate={() => setOpen(false)}>{@render sidebar()}</SheetSidebarHost>
      </SheetContent>
    {/if}
  </div>
</Sheet>
