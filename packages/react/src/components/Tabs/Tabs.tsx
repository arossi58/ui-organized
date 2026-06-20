import { Tabs as ArkTabs } from "@ark-ui/react";
import { clsx } from "clsx";
import { tabsStyles } from "./Tabs.styles.js";
import type { TabsProps } from "./Tabs.types.js";
import "./Tabs.css";

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  size = "default",
  className,
}: TabsProps) {
  // Zag tabs are keyed by string; coerce at the boundary so numeric tab values
  // keep working.
  const resolvedDefault =
    defaultValue != null
      ? String(defaultValue)
      : tabs[0] != null
        ? String(tabs[0].value)
        : undefined;

  return (
    <ArkTabs.Root
      value={value != null ? String(value) : undefined}
      defaultValue={resolvedDefault}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      orientation={orientation}
      className={clsx(tabsStyles({ orientation, size }), className)}
    >
      <ArkTabs.List className="tabs__list">
        {tabs.map((tab) => (
          <ArkTabs.Trigger
            key={tab.value}
            value={String(tab.value)}
            disabled={tab.disabled}
            className="tabs__tab text-emphasis-body-large"
          >
            {tab.label}
          </ArkTabs.Trigger>
        ))}
      </ArkTabs.List>
      <div className="tabs__panels">
        {tabs.map((tab) => (
          <ArkTabs.Content key={tab.value} value={String(tab.value)} className="tabs__panel">
            {tab.content}
          </ArkTabs.Content>
        ))}
      </div>
    </ArkTabs.Root>
  );
}
