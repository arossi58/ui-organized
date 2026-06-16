import { Menu as BaseMenu } from "@base-ui-components/react/menu";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type {
  MenuProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
  MenuSeparatorProps,
  MenuGroupProps,
  MenuGroupLabelProps,
  MenuRadioGroupProps,
  MenuCheckboxItemProps,
  MenuRadioItemProps,
} from "./Menu.types.js";
import "./Menu.css";

/** Menu root — controls open state. */
export function Menu(props: MenuProps) {
  return <BaseMenu.Root {...props} />;
}

/** Element that opens the menu. Use `render` to project a custom button. */
export function MenuTrigger(props: MenuTriggerProps) {
  return <BaseMenu.Trigger {...props} />;
}

/** Portalled, positioned surface holding the menu items. */
export function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset,
  container,
  className,
  children,
  ...popupProps
}: MenuContentProps) {
  return (
    <BaseMenu.Portal container={container}>
      <BaseMenu.Positioner
        className="menu__positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BaseMenu.Popup className={clsx("menu__popup", className)} {...popupProps}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({ icon, destructive, className, children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={clsx("menu__item", destructive && "menu__item--destructive", className)}
      {...props}
    >
      {icon && <Icon name={icon} size={16} className="menu__item-icon" />}
      <span className="menu__item-label">{children}</span>
    </BaseMenu.Item>
  );
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return <BaseMenu.Separator className={clsx("menu__separator", className)} {...props} />;
}

export function MenuGroup({ className, ...props }: MenuGroupProps) {
  return <BaseMenu.Group className={clsx("menu__group", className)} {...props} />;
}

export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return <BaseMenu.GroupLabel className={clsx("menu__group-label", className)} {...props} />;
}

export function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <BaseMenu.RadioGroup {...props} />;
}

export function MenuCheckboxItem({ className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem className={clsx("menu__item", "menu__item--check", className)} {...props}>
      <span className="menu__item-indicator">
        <BaseMenu.CheckboxItemIndicator>
          <Icon name="check" size={16} />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className="menu__item-label">{children}</span>
    </BaseMenu.CheckboxItem>
  );
}

export function MenuRadioItem({ className, children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={clsx("menu__item", "menu__item--check", className)} {...props}>
      <span className="menu__item-indicator">
        <BaseMenu.RadioItemIndicator>
          <span className="menu__radio-dot" />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className="menu__item-label">{children}</span>
    </BaseMenu.RadioItem>
  );
}
