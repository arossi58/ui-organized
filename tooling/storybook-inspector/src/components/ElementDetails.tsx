/** Figma-Dev-Mode detail for the selected element: only the property groups that
 *  apply, each row flagged token / hardcoded / inherited. */
import type { InspectedNode, StyleProp } from "../inspect/extract.js";
import { shorten } from "../inspect/format.js";

function SourceTag({ prop }: { prop: StyleProp }) {
  if (prop.source === "token") {
    return <span className="fcp-var" title={`${prop.varName} = ${prop.value}`}>{prop.varName}</span>;
  }
  if (prop.source === "literal" && prop.tokenable) {
    // Hardcoded where a design token was expected — the thing to notice.
    return <span className="fcp-hardcoded" title="Hardcoded value — not a design token">⚠ hardcoded</span>;
  }
  if (prop.source === "inherited") {
    return <span className="fcp-inherited" title="Inherited from an ancestor">inherited</span>;
  }
  return null;
}

function PropRow({ prop }: { prop: StyleProp }) {
  return (
    <div className="fcp-row" data-flagged={String(prop.source === "literal" && prop.tokenable)}>
      <div className="fcp-row-label"><span title={prop.property}>{prop.property}</span></div>
      <div className="fcp-row-control fcp-prop-value">
        {prop.isColor && <span className="fcp-swatch" style={{ background: prop.value }} />}
        <span className="fcp-mono" title={prop.value}>{shorten(prop.value, 28)}</span>
        <SourceTag prop={prop} />
      </div>
    </div>
  );
}

export function ElementDetails({ node }: { node: InspectedNode }) {
  return (
    <div>
      {node.box && (
        <div className="fcp-size" title="Rendered size">
          <span className="fcp-size-dim">{node.box.width}</span>
          <span className="fcp-size-x">×</span>
          <span className="fcp-size-dim">{node.box.height}</span>
          <span className="fcp-size-unit">px</span>
        </div>
      )}
      {node.textClass && (
        <div className="fcp-row">
          <div className="fcp-row-label"><span>type class</span></div>
          <div className="fcp-row-control" style={{ justifyContent: "flex-start" }}>
            <span className="fcp-var">{node.textClass}</span>
          </div>
        </div>
      )}
      {node.groups.map((group) => (
        <section key={group.title}>
          <div className="fcp-section-header">{group.title}</div>
          {group.props.map((prop) => (
            <PropRow key={`${group.title}:${prop.property}`} prop={prop} />
          ))}
        </section>
      ))}
    </div>
  );
}
