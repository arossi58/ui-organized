import { Accordion as ArkAccordion } from "@ark-ui/react";
import { clsx } from "clsx";
import { accordionStyles } from "./Accordion.styles.js";
import { Icon } from "../Icon/index.js";
import type { AccordionProps } from "./Accordion.types.js";
import "./Accordion.css";

export function Accordion({
  items,
  multiple = true,
  value,
  defaultValue,
  onValueChange,
  disabled,
  variant,
  size,
  className,
}: AccordionProps) {
  return (
    <ArkAccordion.Root
      multiple={multiple}
      // In single mode, keep Base UI's behaviour of being able to close the open
      // item by clicking it again (Zag implies collapsible when `multiple`).
      collapsible={!multiple}
      // Zag accordion values are strings; coerce at the boundary so numeric
      // item values keep working.
      value={value?.map(String)}
      defaultValue={defaultValue?.map(String)}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      disabled={disabled}
      className={clsx(accordionStyles({ variant, size }), className)}
    >
      {items.map((item) => (
        <ArkAccordion.Item
          key={item.value}
          value={String(item.value)}
          disabled={item.disabled}
          className="accordion__item"
        >
          {/* Ark has no Header part — wrap the trigger in a heading ourselves so
              the trigger stays inside a heading for assistive tech. */}
          <h3 className="accordion__header">
            <ArkAccordion.ItemTrigger className="accordion__trigger">
              <span className="accordion__title">{item.title}</span>
              <Icon name="chevron-down" size={20} className="accordion__icon" />
            </ArkAccordion.ItemTrigger>
          </h3>
          <ArkAccordion.ItemContent className="accordion__panel text-default-body-medium">
            <div className="accordion__content">{item.content}</div>
          </ArkAccordion.ItemContent>
        </ArkAccordion.Item>
      ))}
    </ArkAccordion.Root>
  );
}
