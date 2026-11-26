import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { measureTagRow } from "@ui-organized/core";

/** Layout effects warn during server rendering, where there is nothing to measure. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * How many of a row's tags fit on its one line, for Select's and Combobox's
 * multiple mode. `null` until the row has been laid out, so the server (and
 * jsdom) render every tag and no "+N". Re-measured whenever `key` changes and
 * whenever the row or a tag resizes.
 */
export function useTagOverflow(key: string) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () =>
      setFits(measureTagRow(row, Number.parseFloat(getComputedStyle(row).columnGap) || 0));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    for (const tag of row.querySelectorAll(":scope > [data-tag]")) observer.observe(tag);
    return () => observer.disconnect();
  }, [key]);
  return { rowRef, fits };
}
