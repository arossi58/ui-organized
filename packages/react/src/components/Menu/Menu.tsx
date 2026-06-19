import * as React from "react";
import { Menu as ArkMenu, Portal } from "@ark-ui/react";
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

type Positioning = NonNullable<React.ComponentProps<typeof ArkMenu.Root>["positioning"]>;
const SetPositioningContext = React.createContext<((p: Positioning) => void) | null>(null);

/** Menu root — controls open state. */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  const [positioning, setPositioning] = React.useState<Positioning>({
    placement: "bottom-start",
    gutter: 4,
  });
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

/** Element that opens the menu. Pass `render` to project a custom element. */
export function MenuTrigger({ render, children, ...props }: MenuTriggerProps) {
  if (render) {
    return (
      <ArkMenu.Trigger asChild {...props}>
        {render}
      </ArkMenu.Trigger>
    );
  }
  return <ArkMenu.Trigger {...props}>{children}</ArkMenu.Trigger>;
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
  ...contentProps
}: MenuContentProps) {
  const setPositioning = React.useContext(SetPositioningContext);
  const placement = align === "center" ? side : (`${side}-${align}` as const);
  React.useLayoutEffect(() => {
    setPositioning?.({
      placement,
      gutter: sideOffset,
      offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
    });
  }, [setPositioning, placement, sideOffset, alignOffset]);

  return (
    <Portal container={container}>
      <ArkMenu.Positioner className="menu__positioner">
        <ArkMenu.Content className={clsx("menu__popup", className)} {...contentProps}>
          {children}
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </Portal>
  );
}

export function MenuItem({
  icon,
  destructive,
  value,
  onSelect,
  className,
  children,
  ...props
}: MenuItemProps) {
  // Ark requires a stable value per item (Base UI didn't); fall back to a
  // generated id. Typeahead still uses the item's text content.
  const generatedId = React.useId();
  return (
    <ArkMenu.Item
      value={value ?? generatedId}
      onSelect={onSelect}
      className={clsx("menu__item", destructive && "menu__item--destructive", className)}
      {...props}
    >
      {icon && <Icon name={icon} size={16} className="menu__item-icon" />}
      <span className="menu__item-label">{children}</span>
    </ArkMenu.Item>
  );
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return <ArkMenu.Separator className={clsx("menu__separator", className)} {...props} />;
}

export function MenuGroup({ className, ...props }: MenuGroupProps) {
  return <ArkMenu.ItemGroup className={clsx("menu__group", className)} {...props} />;
}

export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return <ArkMenu.ItemGroupLabel className={clsx("menu__group-label", className)} {...props} />;
}

export function MenuRadioGroup({ value, onValueChange, children }: MenuRadioGroupProps) {
  return (
    <ArkMenu.RadioItemGroup
      value={value}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
    >
      {children}
    </ArkMenu.RadioItemGroup>
  );
}

export function MenuCheckboxItem({
  value,
  checked,
  onCheckedChange,
  className,
  children,
  ...props
}: MenuCheckboxItemProps) {
  const generatedId = React.useId();
  return (
    <ArkMenu.CheckboxItem
      value={value ?? generatedId}
      checked={checked ?? false}
      onCheckedChange={onCheckedChange}
      className={clsx("menu__item", "menu__item--check", className)}
      {...props}
    >
      <span className="menu__item-indicator">
        <ArkMenu.ItemIndicator>
          <Icon name="check" size={16} />
        </ArkMenu.ItemIndicator>
      </span>
      <span className="menu__item-label">{children}</span>
    </ArkMenu.CheckboxItem>
  );
}

export function MenuRadioItem({ className, children, ...props }: MenuRadioItemProps) {
  return (
    <ArkMenu.RadioItem className={clsx("menu__item", "menu__item--check", className)} {...props}>
      <span className="menu__item-indicator">
        <ArkMenu.ItemIndicator>
          <span className="menu__radio-dot" />
        </ArkMenu.ItemIndicator>
      </span>
      <span className="menu__item-label">{children}</span>
    </ArkMenu.RadioItem>
  );
}
