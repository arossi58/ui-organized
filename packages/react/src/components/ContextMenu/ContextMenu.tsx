import { ContextMenu as BaseContextMenu } from "@base-ui-components/react/context-menu";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuSeparatorProps,
  ContextMenuGroupProps,
  ContextMenuGroupLabelProps,
  ContextMenuRadioGroupProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
} from "./ContextMenu.types.js";
import "./ContextMenu.css";

/** ContextMenu root — controls open state. */
export function ContextMenu(props: ContextMenuProps) {
  return <BaseContextMenu.Root {...props} />;
}

/** The area that opens the menu on right-click (or long-press). */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <BaseContextMenu.Trigger {...props} />;
}

/** Portalled surface, positioned at the cursor, holding the menu items. */
export function ContextMenuContent({
  sideOffset = 4,
  alignOffset,
  container,
  className,
  children,
  ...popupProps
}: ContextMenuContentProps) {
  return (
    <BaseContextMenu.Portal container={container}>
      <BaseContextMenu.Positioner
        className="context-menu__positioner"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <BaseContextMenu.Popup className={clsx("context-menu__popup", className)} {...popupProps}>
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
}

export function ContextMenuItem({
  icon,
  destructive,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  return (
    <BaseContextMenu.Item
      className={clsx(
        "context-menu__item",
        destructive && "context-menu__item--destructive",
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={16} className="context-menu__item-icon" />}
      <span className="context-menu__item-label">{children}</span>
    </BaseContextMenu.Item>
  );
}

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <BaseContextMenu.Separator className={clsx("context-menu__separator", className)} {...props} />
  );
}

export function ContextMenuGroup({ className, ...props }: ContextMenuGroupProps) {
  return <BaseContextMenu.Group className={clsx("context-menu__group", className)} {...props} />;
}

export function ContextMenuGroupLabel({ className, ...props }: ContextMenuGroupLabelProps) {
  return (
    <BaseContextMenu.GroupLabel
      className={clsx("context-menu__group-label", className)}
      {...props}
    />
  );
}

export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <BaseContextMenu.RadioGroup {...props} />;
}

export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <BaseContextMenu.CheckboxItem
      className={clsx("context-menu__item", "context-menu__item--check", className)}
      {...props}
    >
      <span className="context-menu__item-indicator">
        <BaseContextMenu.CheckboxItemIndicator>
          <Icon name="check" size={16} />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
      <span className="context-menu__item-label">{children}</span>
    </BaseContextMenu.CheckboxItem>
  );
}

export function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <BaseContextMenu.RadioItem
      className={clsx("context-menu__item", "context-menu__item--check", className)}
      {...props}
    >
      <span className="context-menu__item-indicator">
        <BaseContextMenu.RadioItemIndicator>
          <span className="context-menu__radio-dot" />
        </BaseContextMenu.RadioItemIndicator>
      </span>
      <span className="context-menu__item-label">{children}</span>
    </BaseContextMenu.RadioItem>
  );
}
