import { useContext } from "react";
import { clsx } from "clsx";
import { APP_HEADER_CLASS, APP_HEADER_MENU_ICON_SIZE } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { SheetTrigger } from "../Sheet/index.js";
import { glyph } from "../../icons/glyph.js";
import { AppShellContext } from "./AppShellContext.js";
import type { AppHeaderProps } from "./AppShell.types.js";
import "@ui-organized/core/components/Button/Button.css";
import "@ui-organized/core/components/AppShell/AppShell.css";

/**
 * The bar across the top of an AppShell: the product's mark, navigation, and
 * controls at the end. In the sheet layout it leads with the menu button that
 * opens the sidebar, and leaves out `nav`, which has no room on a narrow screen.
 */
export function AppHeader({
  logo,
  nav,
  actions,
  menuLabel = "Open navigation",
  className,
  ...props
}: AppHeaderProps) {
  const shell = useContext(AppShellContext);
  const inSheet = shell?.layout === "sheet";
  const showMenu = inSheet && shell.hasSidebar;
  return (
    <header className={clsx(APP_HEADER_CLASS.root, className)} {...props}>
      {(showMenu || logo != null) && (
        <div className={APP_HEADER_CLASS.start}>
          {showMenu && (
            <SheetTrigger className={APP_HEADER_CLASS.menu} aria-label={menuLabel}>
              <Icon name={glyph("menu")} size={APP_HEADER_MENU_ICON_SIZE} />
            </SheetTrigger>
          )}
          {logo != null && <div className={APP_HEADER_CLASS.logo}>{logo}</div>}
        </div>
      )}
      {nav != null && !inSheet && <div className={APP_HEADER_CLASS.nav}>{nav}</div>}
      {actions != null && <div className={APP_HEADER_CLASS.actions}>{actions}</div>}
    </header>
  );
}
