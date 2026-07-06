import * as React from "react";
import { Menu as ArkMenu, Portal } from "@ark-ui/react";
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
// Reuse the design-system Checkbox / Radio control visuals inside menu items.
import "../Checkbox/Checkbox.css";
import "../Radio/Radio.css";

type Positioning = NonNullable<React.ComponentProps<typeof ArkMenu.Root>["positioning"]>;
const SetPositioningContext = React.createContext<((p: Positioning) => void) | null>(null);

// Ark has no separate context-menu primitive: it's a Menu with a ContextTrigger
// (right-click) that anchors the positioner at the cursor.

/** ContextMenu root — controls open state. */
export function ContextMenu({ open, defaultOpen, onOpenChange, children }: ContextMenuProps) {
  const [positioning, setPositioning] = React.useState<Positioning>({ gutter: 4 });
  return (
    <SetPositioningContext.Provider value={setPositioning}>
      <ArkMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        positioning={positioning}
      >
        {children}
      </ArkMenu.Root>
    </SetPositioningContext.Provider>
  );
}

/** The area that opens the menu on right-click (or long-press). Ark's
 *  ContextTrigger renders a <button>; project the wiring onto a plain <div> so
 *  the target stays an arbitrary content area (no button chrome). */
export function ContextMenuTrigger({ children, ...props }: ContextMenuTriggerProps) {
  return (
    <ArkMenu.ContextTrigger asChild>
      <div {...props}>{children}</div>
    </ArkMenu.ContextTrigger>
  );
}

/** Portalled surface, positioned at the cursor, holding the menu items. */
export function ContextMenuContent({
  sideOffset = 4,
  alignOffset,
  container,
  className,
  children,
  ...contentProps
}: ContextMenuContentProps) {
  const setPositioning = React.useContext(SetPositioningContext);
  React.useLayoutEffect(() => {
    // No placement — the cursor anchor set by ContextTrigger drives it.
    setPositioning?.({
      gutter: sideOffset,
      offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
    });
  }, [setPositioning, sideOffset, alignOffset]);

  return (
    <Portal container={container}>
      <ArkMenu.Positioner className="context-menu__positioner">
        <ArkMenu.Content className={clsx("context-menu__popup", className)} {...contentProps}>
          {children}
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </Portal>
  );
}

export function ContextMenuItem({
  icon,
  destructive,
  value,
  onSelect,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  const generatedId = React.useId();
  return (
    <ArkMenu.Item
      value={value ?? generatedId}
      onSelect={onSelect}
      className={clsx(
        "context-menu__item",
        destructive && "context-menu__item--destructive",
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={16} className="context-menu__item-icon" />}
      <span className="context-menu__item-label">{children}</span>
    </ArkMenu.Item>
  );
}

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return <ArkMenu.Separator className={clsx("context-menu__separator", className)} {...props} />;
}

export function ContextMenuGroup({ className, ...props }: ContextMenuGroupProps) {
  return <ArkMenu.ItemGroup className={clsx("context-menu__group", className)} {...props} />;
}

export function ContextMenuGroupLabel({ className, ...props }: ContextMenuGroupLabelProps) {
  return (
    <ArkMenu.ItemGroupLabel className={clsx("context-menu__group-label", "text-strong-body-small", className)} {...props} />
  );
}

export function ContextMenuRadioGroup({
  value,
  onValueChange,
  children,
}: ContextMenuRadioGroupProps) {
  return (
    <ArkMenu.RadioItemGroup
      value={value}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
    >
      {children}
    </ArkMenu.RadioItemGroup>
  );
}

export function ContextMenuCheckboxItem({
  value,
  checked,
  onCheckedChange,
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const generatedId = React.useId();
  return (
    <ArkMenu.CheckboxItem
      value={value ?? generatedId}
      checked={checked ?? false}
      onCheckedChange={onCheckedChange}
      className={clsx("context-menu__item", "context-menu__item--check", className)}
      {...props}
    >
      {/* Design-system Checkbox control; checked state driven by the item's
          data-state (see ContextMenu.css), not by the CheckboxItem indicator. */}
      <span className="checkbox__control context-menu__control">
        <span className="checkbox__indicator checkbox__indicator--check" />
      </span>
      <span className="context-menu__item-label">{children}</span>
    </ArkMenu.CheckboxItem>
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ArkMenu.RadioItem
      className={clsx("context-menu__item", "context-menu__item--check", className)}
      {...props}
    >
      {/* Design-system Radio control; checked state driven by the item's
          data-state (see ContextMenu.css), not by the RadioItem indicator. */}
      <span className="radio-item__control context-menu__control">
        <span className="radio-item__indicator" />
      </span>
      <span className="context-menu__item-label">{children}</span>
    </ArkMenu.RadioItem>
  );
}
