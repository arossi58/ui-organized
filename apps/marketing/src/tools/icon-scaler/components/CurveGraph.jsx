import { calcStroke } from "../svg.js";

/**
 * The compensation-curve chart. All colors are tokenized so it adapts to the
 * active site theme: axes use the muted border/text tokens, the curve uses the
 * accent (primary interactive) color, and the reference-size marker uses the
 * primary text color. `currentColor` is inherited from the tokenized wrapper.
 */
export default function CurveGraph({ intensity, refSize, refStroke, sizes }) {
  const W = 200, H = 80, pad = 24;
  const minS = Math.min(...sizes, refSize), maxS = Math.max(...sizes, refSize);
  const x = (s) => pad + ((s - minS) / (maxS - minS)) * (W - pad * 2);
  const maxSw = refStroke * Math.pow(maxS / refSize, Math.max(intensity, 0.01));
  const minSw = refStroke * Math.pow(minS / refSize, Math.max(intensity, 0.01));
  const swRange = Math.max(maxSw - minSw, 0.1);
  const y = (sw) => H - pad - ((sw - minSw + 0.2) / (swRange + 0.4)) * (H - pad * 2);

  const pts = [];
  for (let s = minS; s <= maxS; s += 0.5) {
    const sw = calcStroke(refStroke, refSize, s, intensity);
    pts.push(`${x(s)},${y(sw)}`);
  }

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="is-curve-graph"
    >
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} className="is-curve-axis" strokeWidth="1" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} className="is-curve-axis" strokeWidth="1" />
      <polyline points={pts.join(" ")} fill="none" className="is-curve-line" strokeWidth="1.5" opacity="0.85" />
      {sizes.map((s) => {
        const sw = calcStroke(refStroke, refSize, s, intensity);
        return (
          <g key={s}>
            <circle
              cx={x(s)}
              cy={y(sw)}
              r={s === refSize ? 3.5 : 2.5}
              className={s === refSize ? "is-curve-dot-ref" : "is-curve-dot"}
            />
            <text x={x(s)} y={H - 6} textAnchor="middle" fontSize="7" className="is-curve-text">{s}</text>
          </g>
        );
      })}
      <text x={4} y={10} fontSize="7" className="is-curve-text">sw</text>
      <text x={W - pad} y={H - 6} fontSize="7" className="is-curve-text" textAnchor="end">px</text>
    </svg>
  );
}
