/**
 * Figma-Dev-Mode-style inspection of the rendered component: the element tree on
 * the left, the selected element's token-backed style properties on the right.
 *
 * The facts come from `extractInspection` (shared with the Storybook Inspector);
 * only the presentation is local, styled for the docs site rather than
 * Storybook's panel chrome.
 *
 * The valuable column is `source`: a property tagged `literal` where a token was
 * expected is a hardcoded value that should have been a token — which is exactly
 * what someone auditing the design system wants surfaced.
 */
import { useEffect, useState } from "react";
import { ScrollArea } from "@ui-organized/react";
import type { InspectedNode, StyleProp } from "@ui-organized/storybook-inspector/inspect";
import { shorten } from "@ui-organized/storybook-inspector/inspect";
import styles from "./inspect.module.css";

function PropRow({ prop }: { prop: StyleProp }) {
  // A literal in a token-backed slot is the finding worth flagging; a literal
  // `display: flex` is just how CSS works.
  const flagged = prop.source === "literal" && prop.tokenable;
  return (
    <tr>
      <th scope="row" className={styles.propKey}>
        {prop.property}
      </th>
      <td className={styles.propValue}>
        {prop.isColor && (
          <span className={styles.swatch} style={{ background: prop.value }} aria-hidden="true" />
        )}
        <code>{shorten(prop.value)}</code>
      </td>
      <td>
        <span className={styles.source} data-source={flagged ? "flagged" : prop.source}>
          {prop.source === "token" ? (prop.varName ?? "token") : flagged ? "hardcoded" : prop.source}
        </span>
      </td>
    </tr>
  );
}

export function ElementInspector({
  nodes,
  onHighlight,
}: {
  nodes: InspectedNode[];
  onHighlight: (ref: number | null) => void;
}) {
  const [selected, setSelected] = useState(0);

  // Keep the selection valid when the tree changes under us (a control moved,
  // or the story swapped).
  useEffect(() => {
    if (selected >= nodes.length) setSelected(0);
  }, [nodes, selected]);

  // Highlighting is hover-driven only. Outlining the selected node on mount
  // draws a box around the component the moment the page loads, which reads as a
  // rendering artifact rather than a tool — and it lands in screenshots.
  useEffect(() => () => onHighlight(null), [onHighlight]);

  if (nodes.length === 0) {
    return <p className={styles.empty}>Nothing rendered to inspect.</p>;
  }

  const current = nodes[selected] ?? nodes[0]!;

  return (
    <div className={styles.inspector}>
      <ScrollArea className={styles.tree}>
        <ul className={styles.treeList}>
          {nodes.map((node) => (
            <li key={node.ref}>
              <button
                type="button"
                className={styles.treeNode}
                aria-current={node.ref === current.ref}
                style={{
                  paddingLeft: `calc(${node.depth} * var(--spacing-space-03) + var(--spacing-space-02))`,
                }}
                onClick={() => setSelected(node.ref)}
                onFocus={() => onHighlight(node.ref)}
                onBlur={() => onHighlight(null)}
                onMouseEnter={() => onHighlight(node.ref)}
                onMouseLeave={() => onHighlight(null)}
              >
                <span className={styles.treeTag}>{node.label}</span>
                {node.hardcodedCount > 0 && (
                  <span className={styles.treeFlag} title={`${node.hardcodedCount} hardcoded values`}>
                    {node.hardcodedCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <div className={styles.details}>
        <div className={styles.detailsHead}>
          <code className={styles.detailsTag}>{current.label}</code>
          {current.box && (
            <span className={styles.detailsBox}>
              {current.box.width} × {current.box.height}
            </span>
          )}
          {current.textClass && <span className={styles.detailsClass}>{current.textClass}</span>}
        </div>

        {current.groups.length === 0 ? (
          <p className={styles.empty}>No token-backed properties on this element.</p>
        ) : (
          current.groups.map((group) => (
            <div className={styles.group} key={group.title}>
              <h4 className={styles.groupTitle}>{group.title}</h4>
              <table className={styles.propTable}>
                <tbody>
                  {group.props.map((prop) => (
                    <PropRow key={`${group.title}:${prop.property}`} prop={prop} />
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
