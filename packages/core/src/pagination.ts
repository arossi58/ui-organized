/**
 * The page window a pagination control shows: which page numbers, and where the
 * gaps fall.
 *
 * Pure arithmetic on integers — no DOM, no framework — so every ui-organized
 * component library computes the same window from the same inputs rather than
 * each re-deriving it and drifting on the edge cases (a short range with no
 * gaps, a gap exactly one page wide, the window pinned at either end).
 */

export type Ellipsis = { type: "ellipsis"; pages: number[] };
export type PageItem = number | Ellipsis;

export function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * Builds the visible page list with leading/trailing boundary pages and an
 * ellipsis where pages are collapsed. Mirrors the well-known MUI algorithm.
 */
export function getPageItems(
  page: number,
  count: number,
  siblingCount: number,
  boundaryCount: number,
): (number | "ellipsis")[] {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis"] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis"] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

/**
 * Replaces each "ellipsis" marker with the concrete list of pages it collapses,
 * derived from the visible page numbers on either side. This lets the ellipsis
 * act as a jump menu into the hidden range.
 */
export function withEllipsisPages(items: (number | "ellipsis")[]): PageItem[] {
  return items.map((item, index) => {
    if (item !== "ellipsis") return item;
    const prev = items[index - 1];
    const next = items[index + 1];
    const start = typeof prev === "number" ? prev + 1 : 1;
    const end = typeof next === "number" ? next - 1 : start;
    return { type: "ellipsis", pages: range(start, end) };
  });
}

/** Numbered page navigation with previous/next controls. */
