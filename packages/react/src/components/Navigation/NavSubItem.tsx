import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { navSubItemStyles } from "./Navigation.styles.js";
import { useNavContext } from "./NavContext.js";
import type { NavSubItemProps } from "./Navigation.types.js";
import "./Navigation.css";

const ICON_SIZE = 20;

export function NavSubItem({
  label,
  icon,
  selected = false,
  collapsed,
  disabled,
  className,
  ...rest
}: NavSubItemProps) {
  const { collapsed: contextCollapsed } = useNavContext();
  const isCollapsed = collapsed ?? contextCollapsed;

  return (
    <button
      type="button"
      className={clsx(
        "text-default-body-medium",
        navSubItemStyles({ selected }),
        isCollapsed && "nav-sub-item--collapsed",
        className,
      )}
      disabled={disabled}
      aria-current={selected ? "page" : undefined}
      title={isCollapsed && typeof label === "string" ? label : undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={ICON_SIZE} className="nav-sub-item__icon" />}
      <span className="nav-sub-item__label">{label}</span>
    </button>
  );
}
