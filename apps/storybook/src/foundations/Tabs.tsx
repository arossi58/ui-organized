/**
 * The declarative tab wrapper the foundations pages author against:
 *
 *   <Tabs><Tab label="…">…</Tab></Tabs>
 *
 * MDX can't hand a component an array of `{ value, label, content }` objects
 * comfortably, so this reads that shape off the `<Tab>` children and renders the
 * design system's own `Tabs` — the foundations docs should be built out of the
 * system they document rather than a local strip that approximates it. Both
 * surfaces that use this (Storybook's `Color.mdx` and the site's Foundations →
 * Color) get the real component, keyboard behaviour and all.
 */
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { Tabs as UiTabs } from "@ui-organized/react";

interface TabProps {
  label: string;
  children: ReactNode;
}

/**
 * Marker for a single tab — `Tabs` reads its `label` and `children`; it renders
 * nothing on its own.
 */
export function Tab(_props: TabProps): null {
  return null;
}

export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];

  return (
    <UiTabs
      size="small"
      // The label doubles as the value: it's unique within a strip already, and
      // it keeps the authored MDX free of ids that mean nothing to the reader.
      tabs={tabs.map((tab) => ({
        value: tab.props.label,
        label: tab.props.label,
        content: tab.props.children,
      }))}
    />
  );
}
