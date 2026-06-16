import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion";
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
    <BaseAccordion.Root
      multiple={multiple}
      value={value}
      defaultValue={defaultValue}
      onValueChange={
        onValueChange
          ? (v) => onValueChange(v as (string | number)[])
          : undefined
      }
      disabled={disabled}
      className={clsx(accordionStyles({ variant, size }), className)}
    >
      {items.map((item) => (
        <BaseAccordion.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="accordion__item"
        >
          <BaseAccordion.Header className="accordion__header">
            <BaseAccordion.Trigger className="accordion__trigger">
              <span className="accordion__title">{item.title}</span>
              <Icon name="chevron-down" size={20} className="accordion__icon" />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="accordion__panel">
            <div className="accordion__content">{item.content}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
