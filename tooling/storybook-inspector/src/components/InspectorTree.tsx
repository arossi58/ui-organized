/** The element/class tree of the rendered story. A real tree view — parent nodes
 *  can be expanded/collapsed — with token-count / hardcoded / icon badges. Click a
 *  node to inspect + highlight it; click the caret to collapse its subtree. */
import { useMemo, useState } from "react";
import type { InspectedNode } from "../inspect/extract.js";

export function InspectorTree({
  nodes,
  selected,
  onSelect,
  collapsible = true,
}: {
  nodes: InspectedNode[];
  selected: number;
  onSelect: (ref: number) => void;
  collapsible?: boolean;
}) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (ref: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(ref) ? next.delete(ref) : next.add(ref);
      return next;
    });

  // Hide descendants of any collapsed node (by depth run), when in tree mode.
  const shown = useMemo(() => {
    if (!collapsible) return nodes;
    const out: InspectedNode[] = [];
    let hideBelow = Infinity;
    for (const n of nodes) {
      if (n.depth > hideBelow) continue; // inside a collapsed subtree
      hideBelow = Infinity;
      out.push(n);
      if (collapsed.has(n.ref)) hideBelow = n.depth;
    }
    return out;
  }, [nodes, collapsed, collapsible]);

  return (
    <div className="fcp-tree">
      {shown.map((n, i) => (
        <div key={n.ref}>
          {n.portal && !shown[i - 1]?.portal && (
            <div className="fcp-portal-divider">⧉ Portal (open overlay)</div>
          )}
          <div
            className="fcp-tree-row"
            data-active={String(n.ref === selected)}
            data-portal={String(n.portal)}
            style={{ paddingLeft: 4 + n.depth * 12 }}
            title={n.classes.join(" ")}
          >
            {collapsible && n.hasChildren ? (
              <button
                type="button"
                className="fcp-caret"
                data-collapsed={String(collapsed.has(n.ref))}
                aria-label={collapsed.has(n.ref) ? "expand" : "collapse"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(n.ref);
                }}
              >
                ▾
              </button>
            ) : (
              <span className="fcp-caret-spacer" />
            )}
            <button
              type="button"
              className="fcp-tree-main"
              // Don't steal focus from the preview iframe — keeps a focus-managed
              // overlay (dropdown/popover) open while clicking through its elements.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(n.ref)}
            >
              <span className="fcp-tree-tag">{n.tag}</span>
              {n.classes.length > 0 && (
                <span className="fcp-tree-cls">.{n.classes.join(".")}</span>
              )}
              <span className="fcp-tree-badges">
                {n.isIcon && <span className="fcp-chip" title="icon">◆</span>}
                {n.hardcodedCount > 0 && (
                  <span className="fcp-chip fcp-chip-warn" title={`${n.hardcodedCount} hardcoded (non-token) values`}>
                    ⚠{n.hardcodedCount}
                  </span>
                )}
                {n.tokenCount > 0 && (
                  <span className="fcp-chip" title={`${n.tokenCount} token variables applied`}>
                    {n.tokenCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
