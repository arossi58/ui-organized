import { clsx } from "clsx";
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
 * Ark UI has no Menubar primitive (and the menus inside are independent Ark
 * menus), so this is a `role="menubar"` container — arrow-key movement *between*
 * top-level menus is not coordinated; each menu opens/navigates on its own.
 */
export function Menubar({ orientation = "horizontal", className, ...props }: MenubarProps) {
  return (
    <div
      role="menubar"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={clsx("menubar", className)}
      {...props}
    />
  );
}
