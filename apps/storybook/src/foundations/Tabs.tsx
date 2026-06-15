import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import "./tabs.css";

interface TabProps {
  label: string;
  children: ReactNode;
}

/**
 * Marker for a single tab — `Tabs` reads its `label` and `children`; it renders
 * nothing on its own. Lets MDX author tab content declaratively:
 *   <Tabs><Tab label="…">…</Tab></Tabs>
 */
export function Tab(_props: TabProps): null {
  return null;
}

/** Lightweight, theme-agnostic tab strip for docs pages. */
export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];
  const [active, setActive] = useState(0);

  return (
    <div className="doc-tabs">
      <div className="doc-tabs__bar" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.props.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`doc-tabs__tab${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="doc-tabs__panel" role="tabpanel">
        {tabs[active]?.props.children}
      </div>
    </div>
  );
}
