import { SegmentGroup as ArkSegmentGroup } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { segmentedControlStyles } from "./SegmentedControl.styles.js";
import type { SegmentedControlProps } from "./SegmentedControl.types.js";
import "./SegmentedControl.css";

/** Leading icons render at 16px across every size. */
const ICON_SIZE = 16;

export function SegmentedControl({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  disabled,
  name,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  // Uncontrolled controls default to the first segment so the indicator has a
  // starting position; ignored when a controlled `value` is supplied.
  const resolvedDefault = value == null ? (defaultValue ?? items[0]?.value) : undefined;

  return (
    <ArkSegmentGroup.Root
      value={value}
      defaultValue={resolvedDefault}
      onValueChange={
        onValueChange ? (details) => details.value != null && onValueChange(details.value) : undefined
      }
      disabled={disabled}
      name={name}
      orientation="horizontal"
      aria-label={ariaLabel}
      className={clsx(segmentedControlStyles({ size }), className)}
    >
      {/* Sliding highlight behind the selected segment. */}
      <ArkSegmentGroup.Indicator className="segmented__indicator" />
      {items.map((item) => (
        <ArkSegmentGroup.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="segmented__item"
        >
          {item.icon && <Icon name={item.icon} size={ICON_SIZE} className="segmented__item-icon" />}
          <ArkSegmentGroup.ItemText className="segmented__item-text">
            {item.label}
          </ArkSegmentGroup.ItemText>
          <ArkSegmentGroup.ItemHiddenInput />
        </ArkSegmentGroup.Item>
      ))}
    </ArkSegmentGroup.Root>
  );
}
