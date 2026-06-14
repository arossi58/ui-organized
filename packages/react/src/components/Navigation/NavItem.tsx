import { useId, useState } from "react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { navItemStyles } from "./Navigation.styles.js";
import { useNavContext } from "./NavContext.js";
import type { NavItemProps } from "./Navigation.types.js";
import "./Navigation.css";

const ICON_SIZE = 18;
const CARET_SIZE = 20;

export function NavItem({
  label,
  icon,
  selected = false,
  collapsed,
  disabled,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  onClick,
  ...rest
}: NavItemProps) {
  const { collapsed: contextCollapsed } = useNavContext();
  const isCollapsed = collapsed ?? contextCollapsed;

  const expandable = children != null && children !== false;
  // An icon-only rail has no room for an inline sub-list, so suppress it.
  const showSubList = expandable && !isCollapsed;

  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? expanded : internalExpanded;
  const subListId = useId();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (showSubList) {
      const next = !isExpanded;
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    }
    onClick?.(event);
  };

  return (
    <div
      className={clsx(
        "nav-item",
        isCollapsed && "nav-item--collapsed",
        showSubList && isExpanded && "nav-item--expanded",
        className,
      )}
    >
      <button
        type="button"
        className={navItemStyles({ selected, expandable: showSubList })}
        disabled={disabled}
        aria-current={selected ? "page" : undefined}
        aria-expanded={showSubList ? isExpanded : undefined}
        aria-controls={showSubList ? subListId : undefined}
        title={isCollapsed && typeof label === "string" ? label : undefined}
        onClick={handleClick}
        {...rest}
      >
        <span className="nav-item__content">
          {icon && <Icon name={icon} size={ICON_SIZE} className="nav-item__icon" />}
          <span className="nav-item__label">{label}</span>
        </span>
        {showSubList && (
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={CARET_SIZE}
            className="nav-item__caret"
          />
        )}
      </button>
      {showSubList && (
        <div id={subListId} className="nav-item__sub-list" role="list">
          <div className="nav-item__sub-list-inner">{children}</div>
        </div>
      )}
    </div>
  );
}
