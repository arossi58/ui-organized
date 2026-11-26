import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { measureTagRow } from "@ui-organized/core";

/** Layout effects warn during server rendering, where there is nothing to measure. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The room beyond the row's own width that its tags may use: the following
 * element's width above its minimum when the row shares the line with it (a
 * Combobox's text box), less the row's own padding. See `measureTagRow`.
 */
export function tagRowExtra(row: HTMLElement, sharesWithNext: boolean): number {
  const style = getComputedStyle(row);
  const padding = (Number.parseFloat(style.paddingInlineStart) || 0) + (Number.parseFloat(style.paddingInlineEnd) || 0);
  const next = sharesWithNext ? row.nextElementSibling : null;
  if (!(next instanceof HTMLElement)) return -padding;
  const min = Number.parseFloat(getComputedStyle(next).minWidth) || 0;
  return Math.max(0, next.getBoundingClientRect().width - min) - padding;
}

/**
 * How many of a row's tags fit on its one line, for Select's and Combobox's
 * multiple mode. `null` until the row has been laid out, so the server (and
 * jsdom) render every tag and no "+N". Re-measured whenever `key` changes and
 * whenever the row, a tag or (with `sharesWithNext`) the element after the row
 * resizes.
 */
export function useTagOverflow(key: string, sharesWithNext = false) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () =>
      setFits(
        measureTagRow(row, Number.parseFloat(getComputedStyle(row).columnGap) || 0, tagRowExtra(row, sharesWithNext)),
      );
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    for (const tag of row.querySelectorAll(":scope > [data-tag]")) observer.observe(tag);
    if (sharesWithNext && row.nextElementSibling) observer.observe(row.nextElementSibling);
    return () => observer.disconnect();
  }, [key, sharesWithNext]);
  return { rowRef, fits };
}
