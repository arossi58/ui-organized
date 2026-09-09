<!--
  Horizontal container for a row of menus. Place the existing `Menu` components
  inside it — one `<Menu>` per top-level entry — styling each `MenuTrigger` with
  the `menubar__trigger` class:

  ```svelte
  <Menubar>
    <Menu>
      <MenuTrigger class="menubar__trigger">File</MenuTrigger>
      <MenuContent>…</MenuContent>
    </Menu>
  </Menubar>
  ```

  Ark UI has no Menubar primitive and the menus inside are independent Ark
  machines, so the bar supplies the part a menubar owns and a lone menu can't:
  its triggers are menuitems (see ./menubarContext.ts) and arrow keys move
  between them as one tab stop. Opening and navigating within a menu is still
  each menu's own business.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { setInMenubar } from "./menubarContext.js";
  import type { MenubarProps } from "./Menubar.types.js";
  import "@ui-organized/core/components/Menubar/Menubar.css";

  let {
    orientation = "horizontal",
    class: className,
    onkeydown,
    onfocusin,
    children,
    ...rest
  }: MenubarProps = $props();

  setInMenubar();

  let root = $state<HTMLDivElement | null>(null);

  // `data-menubar-item`, not `[role="menuitem"]` — a menu whose content is
  // portalled *into* the bar (a docs preview that contains its own overlays)
  // would otherwise put that menu's own items in range. MenuTrigger sets it.
  const triggers = (): HTMLElement[] =>
    Array.from(root?.querySelectorAll<HTMLElement>("[data-menubar-item]") ?? []);

  /**
   * Roving tabindex — a menubar is a single tab stop, and arrows move within it.
   *
   * Applied to the DOM rather than passed down, because the triggers belong to
   * separate Ark machines and the bar has no handle on their props. Nothing runs
   * during SSR, which is deliberate: React's equivalent is an effect, so neither
   * library emits a `tabindex` on the server and the two agree there too.
   */
  const rove = (focused?: HTMLElement) => {
    const items = triggers();
    const active = focused ?? items.find((item) => item.tabIndex === 0) ?? items[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  };

  $effect(() => {
    const el = root;
    if (!el) return;
    rove();
    /**
     * React re-runs its effect on `children`, which is a fresh object every
     * render; a Svelte snippet is stable, so reading it here would fire once and
     * never again. Watching the DOM is the equivalent that actually holds: a
     * menu added to the bar later arrives with the browser's default tabindex
     * and would become a second tab stop inside a control that is meant to be
     * one.
     *
     * `childList` only — observing attributes would see `rove` write `tabindex`
     * and call itself forever.
     */
    const observer = new MutationObserver(() => rove());
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  const handleKeydown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    // The caller's own handler runs first, the order React has, so a consumer
    // can claim a key by calling preventDefault on it.
    onkeydown?.(event);
    if (event.defaultPrevented) return;

    const [back, forward] =
      orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    const items = triggers();
    const from = items.indexOf(document.activeElement as HTMLElement);
    if (from === -1 || items.length === 0) return;

    let to: number;
    if (event.key === forward) to = (from + 1) % items.length;
    else if (event.key === back) to = (from - 1 + items.length) % items.length;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = items.length - 1;
    else return;

    event.preventDefault();
    const next = items[to];
    if (!next) return;
    rove(next);
    next.focus();
  };

  // `focusin`, not `focus`: React's `onFocus` is its own synthetic event and
  // does bubble, so the DOM equivalent of the handler being ported is the
  // bubbling one. `focus` fires only on the element itself and would never see a
  // trigger — the roving state would then never follow a click.
  const handleFocusin = (event: FocusEvent & { currentTarget: HTMLDivElement }) => {
    onfocusin?.(event);
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-menubar-item]");
    if (item) rove(item);
  };
</script>

<div
  bind:this={root}
  role="menubar"
  aria-orientation={orientation}
  data-orientation={orientation}
  class={clsx("menubar", className)}
  onkeydown={handleKeydown}
  onfocusin={handleFocusin}
  {...rest}
>
  {@render children?.()}
</div>
