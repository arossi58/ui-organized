import * as React from "react";
import { clsx } from "clsx";
import { MenubarContext } from "./MenubarContext.js";
import type { MenubarProps } from "./Menubar.types.js";
import "./Menubar.css";

/**
 * Horizontal container for a row of menus. Place the existing `Menu` components
 * inside it — one `<Menu>` per top-level entry — styling each `MenuTrigger` with
 * the `menubar__trigger` class:
 *
 * ```tsx
 * <Menubar>
 *   <Menu>
 *     <MenuTrigger className="menubar__trigger">File</MenuTrigger>
 *     <MenuContent>…</MenuContent>
 *   </Menu>
 * </Menubar>
 * ```
 *
 * Ark UI has no Menubar primitive and the menus inside are independent Ark
 * machines, so the bar supplies the part a menubar owns and a lone menu can't:
 * its triggers are menuitems (see {@link MenubarContext}) and arrow keys move
 * between them as one tab stop. Opening and navigating within a menu is still
 * each menu's own business.
 */
export function Menubar({
  orientation = "horizontal",
  className,
  onKeyDown,
  onFocus,
  children,
  ...props
}: MenubarProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // `data-menubar-item`, not `[role="menuitem"]` — a menu whose content is
  // portalled *into* the bar (the docs previews contain their overlays) would
  // otherwise put that menu's own items in range. MenuTrigger sets it.
  const triggers = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-menubar-item]") ?? []);

  // Roving tabindex — a menubar is a single tab stop, and arrows move within it.
  // Applied to the DOM rather than passed down because the triggers belong to
  // separate Ark machines; the bar has no React handle on them.
  const rove = React.useCallback((focused?: HTMLElement) => {
    const items = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-menubar-item]") ?? [],
    );
    const active = focused ?? items.find((item) => item.tabIndex === 0) ?? items[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  }, []);

  React.useEffect(() => {
    rove();
  }, [rove, children]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
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

  return (
    <MenubarContext.Provider value>
      <div
        ref={ref}
        role="menubar"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={clsx("menubar", className)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          const item = (event.target as HTMLElement).closest<HTMLElement>("[data-menubar-item]");
          if (item) rove(item);
        }}
        {...props}
      >
        {children}
      </div>
    </MenubarContext.Provider>
  );
}
