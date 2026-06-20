import { useState } from "react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { NavProvider } from "./NavContext.js";
import type { SidebarProps } from "./Navigation.types.js";
import "./Navigation.css";

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
  ...rest
}: SidebarProps) {
  const isControlled = collapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = isControlled ? collapsed : internalCollapsed;

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  const hasLogo = logo != null || logoCollapsed != null;
  const showFooter = footer != null || collapsible;

  return (
    <div
      className={clsx("sidebar", isCollapsed && "sidebar--collapsed", className)}
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
            {collapsible && (
              <button
                type="button"
                className="sidebar__toggle text-default-body-medium"
                onClick={toggle}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                <Icon
                  name={isCollapsed ? "chevron-right" : "chevron-left"}
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
