/**
 * How many chosen-value tags fit on one line of a multi-select field.
 *
 * Shared by Select and Combobox in all four libraries. Every tag is always
 * rendered, so its width can be read; the ones past the count are marked
 * `data-overflowed`, which the stylesheet takes out of flow and out of sight,
 * and a "+N" tag stands for them. With no layout to read (server rendering,
 * jsdom) nothing is measured and every tag shows, so the first render is the
 * same everywhere.
 */

/**
 * The largest number of tags, in order, whose widths and gaps fit `available`
 * along with a `moreWidth` "+N" tag. All of them when they fit without one.
 * Never fewer than one, so a single long value still shows (it ellipsizes).
 */
export function fitTagCount(widths: readonly number[], available: number, gap: number, moreWidth: number): number {
  if (widths.length === 0) return 0;
  const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
  if (total <= available + 0.5) return widths.length;
  let used = 0;
  for (let i = 0; i < widths.length; i++) {
    const next = used + (i ? gap : 0) + widths[i]!;
    if (next + gap + moreWidth > available + 0.5) return Math.max(1, i);
    used = next;
  }
  return widths.length;
}

/**
 * The width reserved for the "+N" tag before it exists, and its minimum width
 * once it does (border-box, so the two agree). Room for "+12" at the sm size.
 */
export const TAG_MORE_WIDTH = 32;

/** The little of a DOM element `measureTagRow` reads; core is built without the DOM lib. */
export interface TagRowLike {
  clientWidth: number;
  querySelectorAll(selector: string): ArrayLike<{ getBoundingClientRect(): { width: number } }>;
}

/**
 * Measure a tag row: its tags are the children marked `data-tag`. `gap` is the
 * row's computed column gap, which the caller reads (core has no DOM globals).
 * Returns how many fit, or `null` when there is no layout to measure.
 */
export function measureTagRow(row: TagRowLike, gap: number): number | null {
  const available = row.clientWidth;
  if (!available) return null;
  const tags = Array.from(row.querySelectorAll(":scope > [data-tag]"));
  const widths = tags.map((tag) => tag.getBoundingClientRect().width);
  return fitTagCount(widths, available, gap, TAG_MORE_WIDTH);
}
