import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
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
  return (
    <BaseTabs.Root
      value={value}
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={clsx(tabsStyles({ orientation, size }), className)}
    >
      <BaseTabs.List className="tabs__list">
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="tabs__tab"
          >
            {tab.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      <div className="tabs__panels">
        {tabs.map((tab) => (
          <BaseTabs.Panel
            key={tab.value}
            value={tab.value}
            className="tabs__panel"
          >
            {tab.content}
          </BaseTabs.Panel>
        ))}
      </div>
    </BaseTabs.Root>
  );
}
