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
import {
  extractInspection,
  openOverlayFor,
  type Inspection,
} from "@ui-organized/storybook-inspector/inspect";

const EMPTY: Inspection = { nodes: [], elements: [] };

export function useInspection(
  stageRef: RefObject<HTMLElement | null>,
  /** Bump to re-read after the preview changes (e.g. a control moved). */
  revision: unknown,
): {
  inspection: Inspection;
  refresh: () => void;
  highlight: (ref: number | null) => void;
  reveal: (ref: number | null) => void;
} {
  const [inspection, setInspection] = useState<Inspection>(EMPTY);
  // Element refs are deliberately kept out of React state — they're live DOM
  // nodes, and putting them in state invites stale references after a re-render.
  const elements = useRef<Element[]>([]);
  const highlighted = useRef<Element | null>(null);
  const selected = useRef<Element | null>(null);

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

  // An overlay opened by clicking its trigger in the preview changes no arg, so
  // `revision` never moves and the tree would keep describing the closed
  // component. Watch the stage instead: contained overlays render inside it, and
  // the attributes below are how Ark reports a popup coming and going.
  //
  // `data-docs-inspected` is deliberately not in the filter — highlighting an
  // element sets it, and observing it would make the highlight refresh the tree
  // that produced the highlight.
  useEffect(() => {
    const root = stageRef.current;
    if (!root || typeof MutationObserver === "undefined") return;

    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributeFilter: ["data-state", "aria-expanded", "open", "hidden"],
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [refresh, stageRef, revision]);

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

  /**
   * Select an element from the tree: outline it in the preview, and — if it
   * lives inside a closed overlay — open that overlay first.
   *
   * Contained overlays mount their content whether or not they're open, so the
   * tree lists a dialog's title and buttons while the dialog is shut. Clicking
   * one of those rows and having nothing happen in the preview is the reason
   * this exists: `openOverlayFor` clicks the trigger whose `aria-controls`
   * names the enclosing content, then the outline lands on something visible.
   *
   * The outline persists (hover's does not) because a click is a deliberate
   * choice of element, and it's what the property list below is describing.
   */
  const reveal = useCallback((ref: number | null) => {
    selected.current?.removeAttribute("data-docs-selected");
    selected.current = null;
    if (ref == null) return;

    const el = elements.current[ref];
    if (!el) return;

    const opened = openOverlayFor(el.ownerDocument, el);
    el.setAttribute("data-docs-selected", "true");
    selected.current = el;

    // Opening runs a state machine and an animation; scroll once it has landed.
    const scroll = () => el.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (opened) window.setTimeout(scroll, 120);
    else scroll();
  }, []);

  // Never leave an outline behind on a component that outlives this page.
  useEffect(
    () => () => {
      highlighted.current?.removeAttribute("data-docs-inspected");
      selected.current?.removeAttribute("data-docs-selected");
    },
    [],
  );

  return { inspection, refresh, highlight, reveal };
}
