import { Menubar as BaseMenubar } from "@base-ui-components/react/menubar";
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
 */
export function Menubar({ className, ...props }: MenubarProps) {
  return <BaseMenubar className={clsx("menubar", className)} {...props} />;
}
