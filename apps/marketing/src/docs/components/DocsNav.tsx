/**
 * The docs category nav — search field over a filtered, grouped list of pages.
 *
 * Lives apart from the shell because it renders into two different hosts: the
 * standing rail on a wide viewport, and the left sheet below `DOCS_COMPACT_QUERY`.
 * Only one is ever mounted (`DocsLayout` branches), so the search query has one
 * home and the `navigation` landmark isn't duplicated.
 */
import { useMemo, useState } from "react";
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

/**
 * Where the rail gives up its column and becomes a sheet.
 *
 * Kept as a JS constant because `DocsLayout` mounts one nav or the other rather
 * than hiding one with CSS. The matching `@media` blocks in layout.module.css
 * and docs.css carry a comment pointing back here — a custom property can't be
 * used in a media condition, so the literal has to be repeated.
 *
 * Deliberately *not* the site nav's 720px: the two answer different questions.
 * This one asks "does the two-column layout still fit" — at 721px the frame less
 * a 15rem rail leaves a ~359px content column, phone-width prose on a tablet.
 */
export const DOCS_COMPACT_QUERY = "(max-width: 900px)";

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

interface DocsNavProps {
  /**
   * Fired after a row navigates. The sheet host uses it to close itself; the
   * standing rail has nothing to do and passes nothing.
   */
  onNavigate?: () => void;
}

export function DocsNav({ onNavigate }: DocsNavProps) {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => getDocsCategories(), []);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // `NavItem` renders a button, so it can't carry `NavLink`'s active state —
  // we resolve it from the route. A component stays selected on its Usage and
  // Inspect views, hence the trailing-slash prefix test rather than equality.
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

  // A fragment, not a box: the host owns the flex column, because the rail and
  // the sheet panel need different padding and edges. `.sidebarScroll` stays
  // here — flexing against that column is the same job in both.
  return (
    <>
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
                      onClick={() => {
                        navigate(link.to);
                        onNavigate?.();
                      }}
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
    </>
  );
}
