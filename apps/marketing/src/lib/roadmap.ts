/**
 * Roadmap data contract (SITE.md §7.3) and pure helpers. The site only ever
 * consumes this shape — never the GitHub API directly; the sync Action
 * (.github/workflows/roadmap-sync.yml) is what maps Projects v2 into it. No
 * React, no DOM here, so the helpers are unit-testable.
 */

export type RoadmapType =
  | "design"
  | "development"
  | "documentation"
  | "testing"
  | "community"
  | "bug";
export type ColumnId = "backlog" | "in-progress" | "done";

export interface RoadmapItem {
  id: string;
  title: string;
  type: RoadmapType;
  /** Issue/PR url, or null for draft items (rendered without a link). */
  url: string | null;
  labels: string[];
}

export interface RoadmapColumn {
  id: ColumnId;
  title: string;
  items: RoadmapItem[];
}

export interface RoadmapData {
  syncedAt: string;
  projectUrl: string;
  doneOverflowUrl: string;
  columns: RoadmapColumn[];
}

/**
 * Design-system `Tag` colour variants. Kept as a local union (not imported
 * from @ui-organized/react) so this module stays React-free and unit-testable; RoadmapCard
 * passes these straight to `<Tag variant>`, so a wrong value fails to compile
 * there.
 */
type TagVariant = "success" | "info" | "info-secondary" | "caution" | "warning" | "error";

/**
 * Per-type presentation, defined once (SITE.md §7.4) — the single source of
 * truth for a tag's display label and its `Tag` colour. To add a tag: add a
 * value to `RoadmapType`, an entry here, and a matching option to the project's
 * `Type` single-select field (plus an alias in sync-roadmap.mjs if the option
 * text differs from the key).
 */
export const TYPE_META: Record<RoadmapType, { label: string; tag: TagVariant }> = {
  design: { label: "Design", tag: "info-secondary" },
  development: { label: "Development", tag: "info" },
  documentation: { label: "Documentation", tag: "caution" },
  testing: { label: "Testing", tag: "success" },
  community: { label: "Community", tag: "warning" },
  bug: { label: "Bug / Fix", tag: "error" },
};

/** Column order + display titles, so the board and the contract agree. */
export const COLUMN_ORDER: Array<{ id: ColumnId; title: string }> = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In progress" },
  { id: "done", title: "Done" },
];

/** Where the board points when there's no synced data yet (empty/error state). */
export const FALLBACK_PROJECT_URL = "https://github.com/users/arossi58/projects/2";

/**
 * Return the columns in canonical board order, tolerating a payload that omits
 * a column or lists them out of order — each missing one renders empty rather
 * than vanishing, so the board always shows three columns.
 */
export function orderColumns(data: RoadmapData): RoadmapColumn[] {
  return COLUMN_ORDER.map(
    ({ id, title }) =>
      data.columns.find((c) => c.id === id) ?? { id, title, items: [] },
  );
}

/** Most recent `Done` cards the board shows before the overflow link (§7.2). */
export const DONE_VISIBLE_LIMIT = 12;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Compact "synced N ago" phrasing for the SyncStatus label (SITE.md §7.4).
 * Pure — `now` is injectable for tests. Returns "just now" under a minute and
 * "unknown" for an unparseable timestamp (never throws into the UI).
 */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "unknown";
  const diff = Math.max(0, now - then);
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `${m} min${m === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(diff / DAY);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** True when the payload has no cards in any column — drives the empty state. */
export function isRoadmapEmpty(data: RoadmapData | null): boolean {
  return !data || data.columns.every((c) => c.items.length === 0);
}
