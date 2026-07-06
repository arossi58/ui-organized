/** Collapsible grouped-property section header, matching Figma's grouped sections
 *  (INSPECTOR.md §4). Pure UI grouping — no logic implication. */
import { useState, type ReactNode } from "react";

export function PropertySection({
  title,
  children,
  defaultCollapsed = false,
}: {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <section>
      <div
        className="fcp-section-header"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        aria-expanded={!collapsed}
      >
        <span className="fcp-section-caret" data-collapsed={String(collapsed)}>
          ▾
        </span>
        {title}
      </div>
      {!collapsed && <div>{children}</div>}
    </section>
  );
}
