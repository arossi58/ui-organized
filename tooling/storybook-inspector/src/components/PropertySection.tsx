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
      {/* A real <button>, not a div with role="button": the toggle was
          mouse-only before — not focusable, and Enter/Space did nothing. The
          extra class only carries the button reset; the shared header class is
          also used by three genuinely static headers. */}
      <button
        type="button"
        className="fcp-section-header fcp-section-header--toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className="fcp-section-caret" data-collapsed={String(collapsed)}>
          ▾
        </span>
        {title}
      </button>
      {!collapsed && <div>{children}</div>}
    </section>
  );
}
