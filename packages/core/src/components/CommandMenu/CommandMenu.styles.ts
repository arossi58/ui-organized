/**
 * A command menu: a search box over a list of commands, in a dialog near the
 * top of the screen. Typing narrows the list; arrows move through it; Enter
 * runs the highlighted command. It sits on Dialog's chrome and a listbox, so
 * these are the parts that are its own: which commands match a query, and how
 * they group.
 */

/** The fields of a command the filter and grouping read. */
export interface CommandMenuItemLike {
  value: string;
  label: string;
  group?: string;
  /** Other words that should find it: `["preferences"]` for "Settings". */
  keywords?: readonly string[];
  disabled?: boolean;
}

/**
 * The commands that match `query`, in the order given. A command matches on
 * its label or any keyword; an empty query matches everything. `contains` is
 * core's `createContains()`, so case and accents are ignored.
 */
export function filterCommandItems<T extends CommandMenuItemLike>(
  items: readonly T[],
  query: string,
  contains: (text: string, query: string) => boolean,
): T[] {
  const needle = query.trim();
  if (!needle) return [...items];
  return items.filter(
    (item) =>
      contains(item.label, needle) || (item.keywords ?? []).some((word) => contains(word, needle)),
  );
}

/**
 * Commands bucketed by `group`, in the order each group first appears. An
 * ungrouped command gets a `null` bucket, which renders without a heading.
 * Grouping the filtered list is what drops a group left with no matches.
 */
export function groupCommandItems<T extends CommandMenuItemLike>(
  items: readonly T[],
): [string | null, T[]][] {
  const buckets = new Map<string | null, T[]>();
  for (const item of items) {
    const key = item.group ?? null;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }
  return [...buckets];
}

/**
 * The first command that can run, which is highlighted whenever the list
 * changes, so Enter always does something visible. In grouped order, since
 * that is the order on screen.
 */
export function firstCommand<T extends CommandMenuItemLike>(items: readonly T[]): string | null {
  for (const [, bucket] of groupCommandItems(items)) {
    const found = bucket.find((item) => !item.disabled);
    if (found) return found.value;
  }
  return null;
}

/** The commands in the order they are drawn: group by group. The listbox's collection must follow it. */
export function orderCommandItems<T extends CommandMenuItemLike>(items: readonly T[]): T[] {
  return groupCommandItems(items).flatMap(([, bucket]) => bucket);
}
