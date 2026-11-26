import { useContext, useState, type MouseEvent } from "react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { isSidebarNavigation } from "@ui-organized/core";
import { NavProvider, SidebarHostContext } from "./NavContext.js";
import type { SidebarProps } from "./Navigation.types.js";
import "@ui-organized/core/components/Navigation/Navigation.css";
import { glyph } from "../../icons/glyph.js";

const TOGGLE_ICON_SIZE = 20;

export function Sidebar({
  logo,
  logoCollapsed,
  footer,
  children,
  navLabel = "Primary",
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  onClick,
  ...rest
}: SidebarProps) {
  const host = useContext(SidebarHostContext);
  const inSheet = host?.inSheet ?? false;
  const isControlled = collapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  // In an AppShell's sheet the sidebar is always expanded: a sheet is not a rail.
  const isCollapsed = inSheet ? false : isControlled ? collapsed : internalCollapsed;
  const showToggle = collapsible && !inSheet;

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  const hasLogo = logo != null || logoCollapsed != null;
  const showFooter = footer != null || showToggle;

  // Bubbling, so the item's own click (the one that navigates) has run first.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (host?.onNavigate && !event.defaultPrevented && isSidebarNavigation(event.target, event.currentTarget)) {
      host.onNavigate();
    }
  };

  return (
    // Delegation, not a control: it hears the clicks the links and buttons
    // inside it receive, which Enter and Space on those fire too.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={clsx("sidebar", isCollapsed && "sidebar--collapsed", className)}
      onClick={handleClick}
      {...rest}
    >
      <NavProvider collapsed={isCollapsed}>
        {hasLogo && (
          <div className="sidebar__logo">
            {isCollapsed ? logoCollapsed ?? logo : logo}
          </div>
        )}

        <nav className="sidebar__nav" aria-label={navLabel}>
          {children}
        </nav>

        {showFooter && (
          <div className="sidebar__footer">
            {footer != null && (
              <div className="sidebar__footer-content">{footer}</div>
            )}
            {showToggle && (
              <button
                type="button"
                className="sidebar__toggle text-default-body-medium"
                onClick={toggle}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                <Icon
                  name={glyph(isCollapsed ? "chevron-right" : "chevron-left")}
                  size={TOGGLE_ICON_SIZE}
                  className="sidebar__toggle-icon"
                />
                <span className="sidebar__toggle-label">
                  {isCollapsed ? "Expand" : "Collapse"}
                </span>
              </button>
            )}
          </div>
        )}
      </NavProvider>
    </div>
  );
}
