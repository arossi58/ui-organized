/**
 * ⌘K search over every docs page: the system's own CommandMenu, listing the
 * fixed pages and every component, grouped the way the rail groups them.
 *
 * One instance, owned by `DocsLayout`, so the hotkey is bound once however the
 * rail is hosted. The rail's filter stays: it narrows what the rail shows,
 * where this jumps straight to a page.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CommandMenu, type CommandMenuItem } from "@ui-organized/react";
import { getDocsCategories } from "../registry";
import { FIXED_LINKS, FOUNDATION_CATEGORIES } from "./DocsNav";

const OpenSearch = createContext<() => void>(() => {});

/** Opens the docs search; the rail's button calls it. */
export function useOpenDocsSearch(): () => void {
  return useContext(OpenSearch);
}

interface DocsSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function DocsSearch({ open, onOpenChange, children }: DocsSearchProps) {
  const navigate = useNavigate();
  const items = useMemo<CommandMenuItem[]>(() => {
    const categories = getDocsCategories();
    const fixed = FIXED_LINKS.map((link) => ({
      value: link.to,
      label: link.label,
      group: "Foundations",
    }));
    const components = categories.flatMap((category) =>
      category.components.map((component) => ({
        value: `/docs/${component.slug}`,
        label: component.name,
        group: FOUNDATION_CATEGORIES.has(category.name) ? "Foundations" : category.name,
        // The code name finds `NavItem` under "Navigation", and the slug finds
        // a page by the word in its address.
        keywords: [component.codeName, component.slug].filter((word): word is string => !!word),
      })),
    );
    return [...fixed, ...components];
  }, []);

  return (
    <OpenSearch.Provider value={() => onOpenChange(true)}>
      {children}
      <CommandMenu
        items={items}
        open={open}
        onOpenChange={onOpenChange}
        onSelect={(to) => navigate(to)}
        hotkey="mod+k"
        label="Search the docs"
        placeholder="Search the docs…"
        emptyMessage="No page matches."
      />
    </OpenSearch.Provider>
  );
}
