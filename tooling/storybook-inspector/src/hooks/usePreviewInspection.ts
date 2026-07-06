/**
 * Reads the live preview DOM from the manager. Inspects the story root AND any
 * portal roots (open dropdowns / date popovers / dialogs render OUTSIDE
 * #storybook-root, into the preview body), so conditionally-rendered content is
 * visible. A MutationObserver auto-refreshes when portals open/close, and element
 * refs are kept so the panel can highlight the selected element in the preview.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useChannel } from "storybook/manager-api";
import { STORY_RENDERED, STORY_ARGS_UPDATED } from "storybook/internal/core-events";
import { extractInspection, type InspectedNode } from "../inspect/extract.js";

const HL_ID = "fcp-highlight";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"]);

function getPreview(): { win: Window; doc: Document; main: Element } | null {
  const iframe = document.getElementById("storybook-preview-iframe") as HTMLIFrameElement | null;
  const win = iframe?.contentWindow ?? undefined;
  const doc = iframe?.contentDocument ?? undefined;
  const main = doc?.getElementById("storybook-root") ?? doc?.getElementById("root") ?? undefined;
  return win && doc && main ? { win, doc, main } : null;
}

/** Selector for real component overlays (Ark scopes/parts + ARIA overlay roles). */
const OVERLAY_SEL = '[data-scope],[data-part],[role="menu"],[role="listbox"],[role="dialog"],[role="tooltip"]';

/** Top-level portal wrappers in the preview body that hold a component overlay. */
function portalRoots(doc: Document, main: Element): Element[] {
  return Array.from(doc.body.children).filter(
    (el) =>
      el !== main &&
      el.id !== HL_ID &&
      el.id !== "storybook-root" &&
      !SKIP_TAGS.has(el.tagName) &&
      el.childElementCount > 0 &&
      (el.matches(OVERLAY_SEL) || el.querySelector(OVERLAY_SEL) != null),
  );
}

/**
 * Open the overlay a portal element belongs to (INSPECTOR ask: clicking a portal
 * element should open it). Walks up to a node whose `id` a trigger points at via
 * `aria-controls`, and clicks that trigger when it's currently closed — so the
 * overlay is actually visible for the highlight, instead of a hidden element.
 */
function openPortalFor(win: Window | null, el: Element | null): void {
  if (!win || !el) return;
  const doc = win.document;
  let node: Element | null = el;
  while (node && node !== doc.body) {
    if (node.id) {
      const trigger = doc.querySelector(`[aria-controls="${node.id.replace(/"/g, '\\"')}"]`);
      if (trigger) {
        const closed =
          trigger.getAttribute("aria-expanded") === "false" ||
          trigger.getAttribute("data-state") === "closed";
        if (closed) (trigger as HTMLElement).click();
        return;
      }
    }
    node = node.parentElement;
  }
}

function drawHighlight(win: Window | null, el: Element | null): void {
  if (!win) return;
  const doc = win.document;
  let box = doc.getElementById(HL_ID) as HTMLDivElement | null;
  if (!el) {
    box?.remove();
    return;
  }
  if (!box) {
    box = doc.createElement("div");
    box.id = HL_ID;
    box.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483647;box-sizing:border-box;" +
      "border:1px solid #4c7dff;background:rgba(76,125,255,0.12);border-radius:2px;transition:all .08s ease;";
  }
  // Re-append so the box is the LAST child of body — a portal (dropdown/popover)
  // that mounts after it would otherwise stack on top and hide the highlight.
  if (doc.body.lastElementChild !== box) doc.body.appendChild(box);
  const r = (el as HTMLElement).getBoundingClientRect();
  box.style.left = `${r.left}px`;
  box.style.top = `${r.top}px`;
  box.style.width = `${r.width}px`;
  box.style.height = `${r.height}px`;
}

export function usePreviewInspection(): {
  nodes: InspectedNode[];
  error: string | null;
  refresh: () => void;
  reveal: (ref: number | null) => void;
  /** Enter "pick" mode: click an element in the preview to select its tree node.
   *  Returns a cleanup that exits pick mode. */
  pick: (onPick: (ref: number) => void) => () => void;
} {
  const [nodes, setNodes] = useState<InspectedNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const winRef = useRef<Window | null>(null);
  const elsRef = useRef<Element[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);
  const observedWin = useRef<Window | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    try {
      const p = getPreview();
      if (!p) {
        setError("Preview not ready — select a story.");
        return;
      }
      const roots = [p.main, ...portalRoots(p.doc, p.main)];
      const { nodes: n, elements } = extractInspection(p.win, roots);
      winRef.current = p.win;
      elsRef.current = elements;
      setNodes(n);
      setError(null);

      // Attach an observer so opening/closing a portal auto-refreshes. Ignore our
      // own highlight-box mutations to avoid a feedback loop.
      if (observedWin.current !== p.win) {
        observerRef.current?.disconnect();
        const obs = new MutationObserver((muts) => {
          const relevant = muts.some((m) => {
            if ((m.target as Element | null)?.id === HL_ID) return false;
            const changed = [...Array.from(m.addedNodes), ...Array.from(m.removedNodes)];
            if (changed.length && changed.every((c) => (c as Element).id === HL_ID)) return false;
            return true;
          });
          if (!relevant) return;
          if (debounce.current) clearTimeout(debounce.current);
          debounce.current = setTimeout(refresh, 150);
        });
        obs.observe(p.doc.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-state", "aria-expanded", "hidden", "open"],
        });
        observerRef.current = obs;
        observedWin.current = p.win;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const reveal = useCallback((ref: number | null) => {
    const win = winRef.current;
    const el = ref == null ? null : elsRef.current[ref] ?? null;
    if (!win || !el) {
      drawHighlight(win, null);
      return;
    }
    // A portalled element (outside #storybook-root) may be a hidden/closed overlay
    // — open it first, then highlight once it's visible.
    if (!el.closest("#storybook-root")) {
      openPortalFor(win, el);
      setTimeout(() => drawHighlight(winRef.current, el), 90);
    } else {
      drawHighlight(win, el);
    }
  }, []);

  const pick = useCallback((onPick: (ref: number) => void) => {
    const win = winRef.current;
    const doc = win?.document;
    if (!win || !doc) return () => {};
    const refOf = (target: EventTarget | null): number => {
      let node = target as Element | null;
      while (node && node !== doc.body) {
        const i = elsRef.current.indexOf(node);
        if (i >= 0) return i;
        node = node.parentElement;
      }
      return -1;
    };
    const onMove = (e: Event) => {
      const i = refOf(e.target);
      // Only highlight while the pointer is over an inspectable element; clear the
      // box the moment it moves onto empty space so nothing lingers highlighted.
      drawHighlight(win, i >= 0 ? elsRef.current[i] ?? null : null);
    };
    const onClick = (e: Event) => {
      const i = refOf(e.target);
      e.preventDefault();
      e.stopPropagation();
      // Clicking outside any inspectable element cancels the pick and clears the
      // highlight instead of leaving the previous selection outlined.
      if (i < 0) {
        drawHighlight(win, null);
        onPick(-1);
        return;
      }
      onPick(i);
    };
    // Capture phase so we intercept before the component reacts to the click.
    doc.addEventListener("mousemove", onMove, true);
    doc.addEventListener("click", onClick, true);
    const prevCursor = doc.body.style.cursor;
    doc.body.style.cursor = "crosshair";
    return () => {
      doc.removeEventListener("mousemove", onMove, true);
      doc.removeEventListener("click", onClick, true);
      doc.body.style.cursor = prevCursor;
    };
  }, []);

  useChannel({
    [STORY_RENDERED]: () => {
      drawHighlight(winRef.current, null);
      observerRef.current?.disconnect();
      observedWin.current = null; // a re-render may swap the window
      setTimeout(refresh, 60);
    },
    [STORY_ARGS_UPDATED]: () => setTimeout(refresh, 60),
  });

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => {
      clearTimeout(t);
      if (debounce.current) clearTimeout(debounce.current);
      observerRef.current?.disconnect();
      drawHighlight(winRef.current, null);
    };
  }, [refresh]);

  return { nodes, error, refresh, reveal, pick };
}
