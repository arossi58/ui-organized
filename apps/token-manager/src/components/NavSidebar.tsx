import { Sidebar, NavItem } from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useSelection, type AppPage } from "../state/SelectionContext.js";

const PAGES: Array<{ id: AppPage; label: string; icon: CanonicalIconName }> = [
  { id: "tokens", label: "Tokens", icon: "grid" },
  { id: "themes", label: "Themes & Modes", icon: "bookmark" },
  { id: "generators", label: "Generators", icon: "star" },
  { id: "export", label: "Export", icon: "download" },
  { id: "sync", label: "Sync", icon: "refresh" },
];

export function NavSidebar() {
  const selection = useSelection();
  return (
    <Sidebar
      collapsible
      navLabel="Token Manager"
      logo={
        <span className="tm-brand">
          <span className="tm-brand__mark" aria-hidden="true" />
          Token Manager
        </span>
      }
      logoCollapsed={<span className="tm-brand__mark" aria-hidden="true" />}
    >
      {PAGES.map((page) => (
        <NavItem
          key={page.id}
          label={page.label}
          icon={page.icon}
          selected={selection.page === page.id}
          onClick={() => selection.setPage(page.id)}
        />
      ))}
    </Sidebar>
  );
}
