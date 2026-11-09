/**
 * The mockup's parts, rendered identically in two places: in the live mockup,
 * and as the matter-js pieces that fall and assemble into it. One renderer for
 * both is what makes the hand-off from pieces to live mockup seamless — the
 * piece that lands is pixel-for-pixel the component it is replaced by.
 */

import type { ComponentType } from "react";
import { LassoSelect, LayoutDashboard, Table2 } from "lucide-react";
import {
  Avatar,
  Button,
  Checkbox,
  ColorPicker,
  DateInput,
  Divider,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Meter,
  NavItem,
  RadioGroup,
  SegmentedControl,
  Select,
  Sidebar,
  Switch,
  TextArea,
  Toolbar,
  type ButtonProps,
} from "@ui-organized/react";
import type { DocFramework } from "@ui-organized/code-connect/browser";
import { BrandMark } from "../../chrome/BrandMark";
import logoUrl from "./assets/logo.svg";
import type { ShowcaseState } from "./showcaseContext";

export type ShowcasePage = "dashboard" | "table";

export const FRAMEWORKS: { value: DocFramework; label: string }[] = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

export const PAGES: Record<ShowcasePage, { nav: string; title: string; icon: ComponentType }> = {
  dashboard: { nav: "Dashboard", title: "Welcome", icon: LayoutDashboard },
  table: { nav: "Table", title: "Table", icon: Table2 },
};

export const STATS = [
  { value: "60+", label: "Components" },
  { value: "2", label: "Figma Plugins" },
  { value: "Fully", label: "Themeable" },
  { value: "$0", label: "Open Source" },
];

const SEGMENTS = [1, 2, 3, 4, 5].map((n) => ({ value: `tab-${n}`, label: "Tab" }));
const RADIOS = [1, 2, 3, 4].map((n) => ({ value: `radio-${n}`, label: "Radio" }));
const FRAMEWORK_OPTIONS = FRAMEWORKS.map(({ value, label }) => ({ value, label }));

// ─── Shell parts ─────────────────────────────────────────────────────────────

interface MockupSidebarProps {
  page?: ShowcasePage;
  onNavigate?: (page: ShowcasePage) => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function MockupSidebar({
  page = "dashboard",
  onNavigate,
  collapsible = true,
  collapsed,
  onCollapsedChange,
}: MockupSidebarProps) {
  return (
    <Sidebar
      className="showcase-sidebar"
      navLabel="Mockup"
      collapsible={collapsible}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      logo={<img src={logoUrl} alt="UI Organized" width={208} height={33.84} />}
      logoCollapsed={<BrandMark glyphOnly />}
    >
      {(Object.keys(PAGES) as ShowcasePage[]).map((key) => (
        <NavItem
          key={key}
          label={PAGES[key].nav}
          icon={PAGES[key].icon as ComponentType<Record<string, unknown>>}
          selected={page === key}
          aria-current={page === key ? "page" : undefined}
          onClick={() => onNavigate?.(key)}
        />
      ))}
    </Sidebar>
  );
}

export function CodeSwitch({
  checked = false,
  onCheckedChange,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return <Switch label="Code" checked={checked} onCheckedChange={onCheckedChange} />;
}

export function MockupAvatar() {
  return <Avatar name="UI Organized" fallback="UI" size="lg" />;
}

export function StatCard({ index }: { index: number }) {
  const stat = STATS[index]!;
  return (
    <div className="showcase-stat">
      <strong className="showcase-stat__value">{stat.value}</strong>
      <span className="showcase-stat__label">{stat.label}</span>
    </div>
  );
}

// ─── Dashboard controls ──────────────────────────────────────────────────────

export type ControlId =
  | "segments"
  | "radios"
  | "input"
  | "textarea"
  | "date"
  | "toolbar"
  | "checks"
  | "meter"
  | "switch"
  | "color"
  | "select"
  | "btn-primary"
  | "btn-dialog"
  | "btn-sheet";

export interface ControlHandlers {
  onDialog?: () => void;
  onSheet?: () => void;
}

export function DashboardControl({ id, onDialog, onSheet }: { id: ControlId } & ControlHandlers) {
  switch (id) {
    case "segments":
      return <SegmentedControl items={SEGMENTS} defaultValue="tab-1" aria-label="View" />;
    case "radios":
      return <RadioGroup label="Label" orientation="horizontal" options={RADIOS} />;
    case "input":
      return <Input label="Input" placeholder="Data" />;
    case "textarea":
      return <TextArea label="Text Area" placeholder="Your input" className="showcase-textarea" />;
    case "date":
      return <DateInput label="Date" />;
    case "toolbar":
      // Actions, each opening its options — not toggles, which would claim
      // an on/off state these commands don't have. Kept identical to the
      // toolbar in DASHBOARD_SPEC, which is what the Code view prints.
      return (
        <Toolbar aria-label="Editing tools" className="showcase-toolbar">
          <Menu>
            <MenuTrigger render={<Button intent="ghost" icon="menu">Menu</Button>} />
            <MenuContent>
              <MenuItem>New file</MenuItem>
              <MenuItem>Open…</MenuItem>
              <MenuItem>Export</MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger render={<Button intent="ghost" icon="pencil">Edit</Button>} />
            <MenuContent>
              <MenuItem>Undo</MenuItem>
              <MenuItem>Redo</MenuItem>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Delete</MenuItem>
            </MenuContent>
          </Menu>
          <Divider orientation="vertical" />
          <Menu>
            <MenuTrigger render={<Button intent="ghost" icon={LassoSelect as ButtonProps["icon"]}>Select</Button>} />
            <MenuContent>
              <MenuItem>Select all</MenuItem>
              <MenuItem>Select none</MenuItem>
              <MenuItem>Invert selection</MenuItem>
            </MenuContent>
          </Menu>
          <Input placeholder="Search" aria-label="Search" />
        </Toolbar>
      );
    case "checks":
      return (
        <div className="showcase-row">
          <Checkbox label="Checkbox" />
          <Checkbox label="Checkbox" />
          <Checkbox label="Checkbox" />
        </div>
      );
    case "meter":
      return <Meter label="Storage remaining" value={62} />;
    case "switch":
      return <Switch label="Switch" />;
    case "color":
      return <ColorPicker label="Color" defaultValue="#bc4900" />;
    case "select":
      return <Select label="Label" placeholder="Select" options={FRAMEWORK_OPTIONS} />;
    case "btn-primary":
      return <Button intent="primary">Button</Button>;
    case "btn-dialog":
      return (
        <Button intent="secondary" onClick={onDialog}>
          Dialog
        </Button>
      );
    case "btn-sheet":
      return (
        <Button intent="tertiary" onClick={onSheet}>
          Sheet
        </Button>
      );
  }
}

// ─── The piece set ───────────────────────────────────────────────────────────

/**
 * A falling piece is one of two things.
 *
 * A **part** is the live component itself: mounted once, moved between its
 * mockup slot and its physics shell by `PartHost`, so its state survives the
 * trip. Every control, stat card and the data table is a part.
 *
 * A **mirror** is a second instance of a piece of mockup chrome — the
 * sidebar, the page title, the Code switch, the avatar. Their
 * whole state is the shared `ShowcaseState`, so a mirror drawn from it is
 * indistinguishable from the original, and they stay out of the mockup's
 * layout structure, which a part would have to be cut out of. `target` is the
 * live element the mirror stands in for.
 */
export type PieceSpec =
  | { id: string; kind: "part"; shape: "rect" | "circle" }
  /** A static copy of a piece of the live data table (snapshot.ts), taken
   * when the mockup comes apart. `target` is that piece, inside the mockup. */
  | { id: string; kind: "snapshot"; shape: "rect"; target: string }
  | {
      id: string;
      kind: "mirror";
      shape: "rect" | "circle";
      target: string;
      render: (state: ShowcaseState) => JSX.Element;
    };

const MIRROR_SPECS: PieceSpec[] = [
  {
    id: "sidebar",
    kind: "mirror",
    shape: "rect",
    target: ".showcase-sidebar",
    render: (s) => (
      <MockupSidebar page={s.page} collapsible={!s.narrow} collapsed={s.narrow || s.collapsed} />
    ),
  },
  {
    id: "title",
    kind: "mirror",
    shape: "rect",
    target: '[data-piece="title"] > *',
    render: (s) => <h2 className="showcase-header__title">{PAGES[s.page].title}</h2>,
  },
  {
    id: "code",
    kind: "mirror",
    shape: "rect",
    target: '[data-piece="code"] > *',
    render: (s) => <CodeSwitch checked={s.code} />,
  },
  {
    id: "avatar",
    kind: "mirror",
    shape: "circle",
    target: '[data-piece="avatar"] > *',
    render: () => <MockupAvatar />,
  },
];

/** The dashboard's parts, in assembly order: stats, then the panel top-down. */
export const DASHBOARD_PART_IDS = [
  "stat-0",
  "stat-1",
  "stat-2",
  "stat-3",
  "segments",
  "toolbar",
  "radios",
  "checks",
  "input",
  "meter",
  "switch",
  "textarea",
  "color",
  "select",
  "date",
  "btn-primary",
  "btn-dialog",
  "btn-sheet",
] as const;

export const TABLE_PART_IDS = ["table"] as const;

export type PartId = (typeof DASHBOARD_PART_IDS)[number] | (typeof TABLE_PART_IDS)[number];

export const ALL_PART_IDS: PartId[] = [...DASHBOARD_PART_IDS, ...TABLE_PART_IDS];

const part = (id: string): PieceSpec => ({ id, kind: "part", shape: "rect" });

const TABLE_SCOPE = '[data-piece="table"]';

/** Most body rows that fall. More than the viewport ever shows at once; a row
 * that isn't on screen when the mockup comes apart measures empty and sits
 * the fall out. */
export const TABLE_ROW_PIECES = 12;

/**
 * The Table page breaks up the way the dashboard does: toolbar, filter bar,
 * header row, each visible row and the pagination fall separately. They are
 * snapshots rather than parts — the table is one live component and stays
 * whole in its slot (see snapshot.ts) — so the grid's frame is left behind as
 * the shell the rows land in.
 */
const TABLE_SNAPSHOT_SPECS: PieceSpec[] = [
  { id: "table-toolbar", target: `${TABLE_SCOPE} .data-table__toolbar` },
  { id: "table-subbar", target: `${TABLE_SCOPE} .data-table__subbar` },
  { id: "table-head", target: `${TABLE_SCOPE} thead > tr` },
  ...Array.from({ length: TABLE_ROW_PIECES }, (_, i) => ({
    id: `table-row-${i}`,
    target: `${TABLE_SCOPE} tbody > tr[data-index="${i}"]`,
  })),
  { id: "table-pagination", target: `${TABLE_SCOPE} .data-table__pagination` },
].map((spec) => ({ ...spec, kind: "snapshot" as const, shape: "rect" as const }));

/** The pieces for a page: its chrome, then its content. Order is the
 * assembly stagger order. */
export function pieceSpecsFor(page: ShowcasePage): PieceSpec[] {
  return page === "dashboard"
    ? [...MIRROR_SPECS, ...DASHBOARD_PART_IDS.map(part)]
    : [...MIRROR_SPECS, ...TABLE_SNAPSHOT_SPECS];
}
