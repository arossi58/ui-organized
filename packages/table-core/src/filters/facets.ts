/**
 * Turning a column's facets into the options an enum editor renders.
 *
 * The counts already mean the right thing without any work from us: TanStack's
 * faceted row model applies every *other* column's filters and the global
 * filter, and excludes the column's own. So "Platform · 12" means twelve rows
 * survive if you tick it given everything else already applied — which is
 * exactly the "counts at the input level" the pattern asks for — while ticking
 * a second value in the same list does not collapse the first one's count.
 */
import type { TableFilterOption, TableFilterValue } from "./types.js";

export interface TableFilterFacetOption {
  value: string;
  label: string;
  /** Rows that would survive if this value were ticked. `0` when counts are off. */
  count: number;
  /** Ticking it would yield nothing, so it is offered but not selectable. */
  disabled: boolean;
  selected: boolean;
}

/**
 * Counting is an O(rows) pass with an allocation per row, so it is off above
 * this many rows unless a column asks for it. A 100,000-row table should
 * declare its `options` instead.
 */
export const FACET_ROW_LIMIT = 20_000;

/**
 * Numbers before letters, and numerically among themselves.
 *
 * A bare `.sort()` orders `1, 10, 2` — which is what the filter this replaces
 * did, and it looks broken in any list of numeric ids.
 */
function compareOptions(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  const aNumeric = a !== "" && !Number.isNaN(na);
  const bNumeric = b !== "" && !Number.isNaN(nb);
  if (aNumeric && bNumeric) return na - nb;
  if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
  return a.localeCompare(b);
}

export function facetOptions(
  facets: ReadonlyMap<unknown, number> | undefined,
  declared: readonly TableFilterOption[] | undefined,
  selected: readonly TableFilterValue[],
  showCounts = true,
): TableFilterFacetOption[] {
  const counts = new Map<string, number>();
  if (facets) {
    for (const [value, count] of facets) {
      if (value === null || value === undefined) continue;
      counts.set(String(value), count);
    }
  }
  const chosen = new Set(selected.map((value) => String(value)));

  // A declared list owns both the order and the labels — the engineer decided
  // that statuses read best by urgency, not alphabetically.
  const base: TableFilterOption[] = declared
    ? [...declared]
    : [...counts.keys()].sort(compareOptions).map((value) => ({ value, label: value }));

  // A ticked value must appear even when the facets no longer contain it.
  // Facets reflect the *other* applied filters, so narrowing elsewhere can drop
  // a value the user has already chosen — and a selected option missing from
  // its own list is one the user has no way to unselect.
  for (const value of chosen) {
    if (!base.some((option) => option.value === value)) {
      base.push({ value, label: value });
    }
  }

  return base.map((option) => {
    const count = counts.get(option.value) ?? 0;
    const isSelected = chosen.has(option.value);
    return {
      value: option.value,
      label: option.label,
      count: showCounts ? count : 0,
      // Never disable something already ticked: the user would have no way to
      // untick it. This is the rule everyone gets wrong.
      disabled: showCounts && count === 0 && !isSelected,
      selected: isSelected,
    };
  });
}

/**
 * Filter and cap the option list. In core so a second adapter searches
 * identically, and so the cap is one number rather than a per-adapter guess.
 */
export function searchOptions(
  options: readonly TableFilterFacetOption[],
  query: string,
  limit = 100,
): TableFilterFacetOption[] {
  const needle = query.trim().toLowerCase();
  const matched = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;
  return matched.length > limit ? matched.slice(0, limit) : [...matched];
}

// ─── Field ordering ──────────────────────────────────────────────────────────

export interface OrderableField {
  columnId: string;
  label: string;
  /** Lower comes first. Undefined sorts after every declared priority. */
  priority?: number;
  /** Position among the table's columns — the tiebreak. */
  index: number;
}

/**
 * The order fields appear in the "Add filter" list.
 *
 * Declared priority first, then column order. Above a threshold the whole list
 * goes alphabetical instead: with a handful of fields a considered order helps,
 * but past a dozen nobody scans for meaning — they scan for a word, and only
 * alphabetical supports that.
 */
export const ALPHABETICAL_FIELD_THRESHOLD = 10;

export function orderFilterableFields<T extends OrderableField>(fields: T[]): T[] {
  if (fields.length > ALPHABETICAL_FIELD_THRESHOLD) {
    return [...fields].sort((a, b) => a.label.localeCompare(b.label));
  }
  return [...fields].sort((a, b) => {
    const pa = a.priority ?? Number.MAX_SAFE_INTEGER;
    const pb = b.priority ?? Number.MAX_SAFE_INTEGER;
    return pa - pb || a.index - b.index;
  });
}
