/**
 * Element/token inspection over the live preview.
 *
 * The Storybook Inspector needs 230 lines of channel plumbing to do this,
 * because the DOM it wants to read lives in the preview iframe and the panel
 * lives in the manager. Here the component renders in the same document as the
 * page, so the whole thing collapses to reading a ref — which is the clearest
 * argument for the native docs site there is.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { extractInspection, type Inspection } from "@ui-organized/storybook-inspector/inspect";

const EMPTY: Inspection = { nodes: [], elements: [] };

export function useInspection(
  stageRef: RefObject<HTMLElement | null>,
  /** Bump to re-read after the preview changes (e.g. a control moved). */
  revision: unknown,
): { inspection: Inspection; refresh: () => void; highlight: (ref: number | null) => void } {
  const [inspection, setInspection] = useState<Inspection>(EMPTY);
  // Element refs are deliberately kept out of React state — they're live DOM
  // nodes, and putting them in state invites stale references after a re-render.
  const elements = useRef<Element[]>([]);
  const highlighted = useRef<Element | null>(null);

  const refresh = useCallback(() => {
    const root = stageRef.current;
    if (!root) {
      setInspection(EMPTY);
      return;
    }
    const next = extractInspection(window, [root]);
    elements.current = next.elements;
    setInspection(next);
  }, [stageRef]);

  useEffect(() => {
    // One frame's delay so layout has settled — box sizes are read from
    // getBoundingClientRect and would otherwise all come back zero on first paint.
    const id = requestAnimationFrame(refresh);
    return () => cancelAnimationFrame(id);
  }, [refresh, revision]);

  const highlight = useCallback((ref: number | null) => {
    if (highlighted.current) {
      highlighted.current.removeAttribute("data-docs-inspected");
      highlighted.current = null;
    }
    if (ref == null) return;
    const el = elements.current[ref];
    if (!el) return;
    el.setAttribute("data-docs-inspected", "true");
    highlighted.current = el;
  }, []);

  // Never leave an outline behind on a component that outlives this page.
  useEffect(() => () => highlighted.current?.removeAttribute("data-docs-inspected"), []);

  return { inspection, refresh, highlight };
}
