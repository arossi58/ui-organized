/**
 * Page header + the Docs/Inspect tab bar.
 *
 * The tab strip is the design system's own `Tabs`, driven by the router rather
 * than by its internal state: `value` comes from the active route and
 * `onValueChange` navigates. The page body is passed as the active tab's
 * content, so the real `tabpanel` wraps it and the ARIA relationship is correct
 * — rather than rendering a strip of empty panels next to the content.
 *
 * Keeping the two views as separate routes is the point: they stay linkable,
 * shareable and back/forward navigable, which is exactly what the old iframe
 * couldn't do.
 */
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@ui-organized/react";
import styles from "./layout.module.css";

interface DocsPageHeaderProps {
  title: string;
  /** One-paragraph description. */
  lede?: ReactNode;
  /** Import line, Open in Storybook, Copy for AI, … */
  actions?: ReactNode;
}

// No eyebrow above the title: it only ever said "Documentation", which the rail,
// the URL and the page you clicked to get here all say already.
export function DocsPageHeader({ title, lede, actions }: DocsPageHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {lede && <p className={styles.lede}>{lede}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export interface DocsTab {
  /** Stable id, also the value the tab strip is controlled by. */
  id: string;
  label: string;
  /** Route this tab navigates to. */
  to: string;
}

export function DocsTabs({
  tabs,
  active,
  children,
}: {
  tabs: DocsTab[];
  /** `id` of the tab for the current route. */
  active: string;
  /** The page body — rendered inside the active tab's panel. */
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.tabs}>
      <Tabs
        size="small"
        value={active}
        onValueChange={(value) => {
          const next = tabs.find((tab) => tab.id === String(value));
          if (next && String(value) !== active) navigate(next.to);
        }}
        tabs={tabs.map((tab) => ({
          value: tab.id,
          label: tab.label,
          // Only the active tab has content: the inactive one's panel belongs to
          // a different route that hasn't been rendered.
          content: tab.id === active ? children : null,
        }))}
      />
    </div>
  );
}
