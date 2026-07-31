/**
 * Figma-Dev-Mode-style inspection of the rendered component: the element tree,
 * then the selected element's token-backed style properties.
 *
 * The facts come from `extractInspection` (shared with the Storybook Inspector);
 * only the presentation is local, styled for the docs site rather than
 * Storybook's panel chrome. It renders inside the Inspect tab of the properties
 * panel, so everything stacks in a single column and each row has to survive
 * being narrow.
 *
 * The valuable column is `source`: a property tagged `literal` where a token was
 * expected is a hardcoded value that should have been a token — which is exactly
 * what someone auditing the design system wants surfaced.
 */
import { useEffect, useState } from "react";
import { ScrollArea, Tag } from "@ui-organized/react";
import type { InspectedNode, StyleProp } from "@ui-organized/storybook-inspector/inspect";
import { shorten } from "@ui-organized/storybook-inspector/inspect";
import styles from "./inspect.module.css";

/**
 * Where a value came from. The two states worth acting on get a status `Tag`;
 * `inherited` and literals in slots no token covers are context, and reading as
 * quiet text keeps a dense element from becoming a wall of chips.
 */
function SourceTag({ prop }: { prop: StyleProp }) {
  if (prop.source === "token") {
    const name = prop.varName ?? "token";
    return (
      <Tag size="sm" variant="success" emphasized={false} className={styles.sourceTag} title={name}>
        {name}
      </Tag>
    );
  }

  // A literal in a token-backed slot is the finding worth flagging; a literal
  // `display: flex` is just how CSS works.
  if (prop.source === "literal" && prop.tokenable) {
    return (
      <Tag size="sm" variant="warning" emphasized={false}>
        hardcoded
      </Tag>
    );
  }

  return <span className={styles.sourceMuted}>{prop.source}</span>;
}

function PropRow({ prop }: { prop: StyleProp }) {
  return (
    <div className={styles.propRow}>
      <dt className={styles.propKey}>{prop.property}</dt>
      <dd className={styles.propValue}>
        <span className={styles.valueLine}>
          {prop.isColor && (
            <span className={styles.swatch} style={{ background: prop.value }} aria-hidden="true" />
          )}
          <code title={prop.value}>{shorten(prop.value)}</code>
        </span>
        <SourceTag prop={prop} />
      </dd>
    </div>
  );
}

export function ElementInspector({
  nodes,
  onHighlight,
  onReveal,
}: {
  nodes: InspectedNode[];
  onHighlight: (ref: number | null) => void;
  /** Selecting a row outlines it in the preview, opening its overlay if shut. */
  onReveal: (ref: number | null) => void;
}) {
  const [selected, setSelected] = useState(0);

  // Keep the selection valid when the tree changes under us (a control moved,
  // or the story swapped).
  useEffect(() => {
    if (selected >= nodes.length) setSelected(0);
  }, [nodes, selected]);

  // Hover previews an element; a click selects it and keeps the outline. What
  // is deliberately NOT done is outlining on mount — that draws a box around the
  // component the moment the page loads, which reads as a rendering artifact
  // rather than a tool, and it lands in screenshots.
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
                onClick={() => {
                  setSelected(node.ref);
                  onReveal(node.ref);
                }}
                onFocus={() => onHighlight(node.ref)}
                onBlur={() => onHighlight(null)}
                onMouseEnter={() => onHighlight(node.ref)}
                onMouseLeave={() => onHighlight(null)}
              >
                <span className={styles.treeTag}>{node.label}</span>
                {node.hardcodedCount > 0 && (
                  <Tag
                    size="sm"
                    variant="warning"
                    emphasized={false}
                    className={styles.treeFlag}
                    title={`${node.hardcodedCount} hardcoded values`}
                  >
                    {node.hardcodedCount}
                  </Tag>
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
              <dl className={styles.propList}>
                {group.props.map((prop) => (
                  <PropRow key={`${group.title}:${prop.property}`} prop={prop} />
                ))}
              </dl>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
