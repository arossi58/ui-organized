import { Toggle as ArkToggle, ToggleGroup as ArkToggleGroup } from "@ark-ui/react";
import { clsx } from "clsx";
import { toggleStyles } from "./Toggle.styles.js";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS } from "../controlSize.js";
import type { ToggleProps, ToggleGroupProps } from "./Toggle.types.js";
import "./Toggle.css";

/** A two-state button that can be on or off. */
export function Toggle({
  size,
  icon,
  value,
  pressed,
  defaultPressed,
  onPressedChange,
  className,
  children,
  ...props
}: ToggleProps) {
  const resolvedSize = size ?? "md";
  const cls = clsx(CONTROL_TEXT_CLASS[resolvedSize], toggleStyles({ size: resolvedSize }), className);
  const content = (
    <>
      {icon && <Icon name={icon} size={CONTROL_ICON_SIZE[resolvedSize]} />}
      {children}
    </>
  );

  // Base UI used one Toggle for both roles; Ark splits the standalone toggle
  // (Toggle.Root) from the group item (ToggleGroup.Item). A `value` marks a
  // group item — it derives its pressed state from the parent group.
  if (value !== undefined) {
    return (
      <ArkToggleGroup.Item value={value} className={cls} {...props}>
        {content}
      </ArkToggleGroup.Item>
    );
  }

  return (
    <ArkToggle.Root
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      className={cls}
      {...props}
    >
      {content}
    </ArkToggle.Root>
  );
}

/** Groups a set of `<Toggle>` buttons, optionally as a single- or multi-select. */
export function ToggleGroup({
  value,
  defaultValue,
  onValueChange,
  multiple,
  disabled,
  orientation,
  className,
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ArkToggleGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      multiple={multiple}
      disabled={disabled}
      orientation={orientation}
      className={clsx("toggle-group", className)}
      {...props}
    >
      {children}
    </ArkToggleGroup.Root>
  );
}
