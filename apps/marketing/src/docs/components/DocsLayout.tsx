/**
 * The docs shell — sticky category rail beside the content column.
 *
 * Every docs route renders through this: the Introduction, the two Foundations
 * pages, and both component views. Keeping the chrome in one place is what makes
 * a new docs page a matter of composing sections rather than rebuilding a page.
 */
import { useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Divider, Icon, NavItem, NavProvider, ScrollArea, SearchInput } from "@ui-organized/react";
import {
  Boxes,
  ChevronsUpDown,
  Compass,
  Layers,
  LayoutGrid,
  MessageSquareWarning,
  MousePointerClick,
  SquareStack,
  Table2,
  TextCursorInput,
} from "lucide-react";
import { getDocsCategories } from "../registry";
import styles from "./layout.module.css";

interface DocsLayoutProps {
  children: ReactNode;
}

/** Static entries that sit above the generated component list. */
const FIXED_LINKS = [
  { to: "/docs", label: "Introduction", exact: true },
  { to: "/docs/get-started", label: "Get started" },
  { to: "/docs/theming", label: "Theming" },
  { to: "/docs/foundations/color", label: "Color" },
  { to: "/docs/foundations/typography", label: "Typography" },
] as const;

/**
 * Story categories that belong in the top group rather than in a section of
 * their own. `Foundation/Icon` is the only one today, and listing it under its
 * own heading gave the rail two foundations sections — Color and Typography up
 * top, Icon alone at the bottom.
 */
const FOUNDATION_CATEGORIES = new Set(["Foundation", "Foundations"]);

/**
 * A glyph per rail section, keyed by the story category (`Foundations` is the
 * fixed top group). Passed to the kit's `Icon` as components rather than
 * canonical names: the canonical set is a small UI vocabulary — chevrons,
 * checks, alerts — with nothing that says "overlay" or "data display", and
 * `Icon` takes a library component directly for exactly this case.
 */
const CATEGORY_ICONS: Record<string, typeof Layers> = {
  Foundations: Layers,
  Forms: TextCursorInput,
  Actions: MousePointerClick,
  Navigation: Compass,
  Overlay: SquareStack,
  Disclosure: ChevronsUpDown,
  Feedback: MessageSquareWarning,
  "Data Display": Table2,
  Layout: LayoutGrid,
};

/**
 * Section heading. `text-default-body-medium` and the 18px glyph are the same
 * type utility and icon size `NavItem` uses, so a heading and the rows under it
 * sit on one baseline grid; only the colour separates them, and the divider
 * above does the rest of the work of setting sections apart.
 */
function GroupLabel({ name }: { name: string }) {
  return (
    <span className={`${styles.groupLabel} text-default-body-medium`}>
      <Icon name={CATEGORY_ICONS[name] ?? Boxes} size={18} />
      {name}
    </span>
  );
}

interface RailLink {
  to: string;
  label: string;
  exact?: boolean;
}

interface RailSection {
  name: string;
  links: RailLink[];
}

function DocsSidebar() {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => getDocsCategories(), []);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // `NavItem` renders a button, so it can't carry `NavLink`'s active state —
  // we resolve it from the route. A component stays selected on its Inspect
  // view, hence the trailing-slash prefix test rather than a bare equality.
  const isActive = (to: string, exact = false) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return categories;
    return categories
      .map((category) => ({
        ...category,
        components: category.components.filter(
          (component) =>
            component.name.toLowerCase().includes(needle) ||
            component.codeName?.toLowerCase().includes(needle),
        ),
      }))
      .filter((category) => category.components.length > 0);
  }, [categories, needle]);

  // The fixed pages and the foundation-category stories are one group: the
  // static Color/Typography pages and the generated Icon page document the same
  // layer of the system.
  const overview: RailLink[] = [
    ...FIXED_LINKS.filter((link) => !needle || link.label.toLowerCase().includes(needle)),
    ...filtered
      .filter((category) => FOUNDATION_CATEGORIES.has(category.name))
      .flatMap((category) =>
        category.components.map((component) => ({
          to: `/docs/${component.slug}`,
          label: component.name,
        })),
      ),
  ];

  // One flat list of sections so the rail renders them uniformly — same
  // heading, same rows, a divider between each.
  const sections: RailSection[] = [
    ...(overview.length > 0 ? [{ name: "Foundations", links: overview }] : []),
    ...filtered
      .filter((category) => !FOUNDATION_CATEGORIES.has(category.name))
      .map((category) => ({
        name: category.name,
        links: category.components.map((component) => ({
          to: `/docs/${component.slug}`,
          label: component.name,
        })),
      })),
  ];

  return (
    <aside className={styles.sidebar} aria-label="Documentation">
      <SearchInput
        label="Search components"
        placeholder="Search…"
        size="sm"
        clearable
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
      />

      {/* The kit's `ScrollArea` rather than a bare `overflow-y: auto` — the
          native bar draws a bordered track that ignores the theme, and this is
          the same themed overlay bar the rest of the system uses. */}
      <ScrollArea className={styles.sidebarScroll}>
        <nav className={styles.sidebarNav} aria-label="Documentation">
          {/* The design system's own nav primitives, so the rail matches every
              other navigation surface on the site (and the selected item gets the
              filled brand treatment with light text from `.nav-item__trigger
              --selected` rather than a local approximation). */}
          <NavProvider collapsed={false}>
            {sections.map((section, index) => (
              <div className={styles.group} key={section.name}>
                {/* Between sections, not above the first — a rule under the
                    search field would read as chrome rather than as a break. */}
                {index > 0 && <Divider className={styles.groupDivider} />}
                <GroupLabel name={section.name} />
                <div className={styles.groupList}>
                  {section.links.map((link) => (
                    <NavItem
                      key={link.to}
                      label={link.label}
                      selected={isActive(link.to, link.exact ?? false)}
                      onClick={() => navigate(link.to)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </NavProvider>

          {sections.length === 0 && (
            <p className={styles.empty}>No components match “{query}”.</p>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    // `docs-root` is a plain global hook for the route-level background in
    // docs.css; the module class owns the layout.
    <div className={`${styles.root} docs-root`}>
      <DocsSidebar />
      <ScrollArea className={styles.main}>
        <main className={styles.mainInner} id="main">
          {children}
        </main>
      </ScrollArea>
    </div>
  );
}
