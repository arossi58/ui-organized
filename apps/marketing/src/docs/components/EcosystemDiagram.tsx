/**
 * The "one config flows through every layer" diagram on the Introduction page.
 *
 * Drawn as SVG rather than the ASCII block it replaces: box-drawing characters
 * only line up in a monospace font at one size, they carry no structure for a
 * screen reader, and the arrows can't be toned to separate the core pipeline
 * from the tooling that hangs off it. Here the geometry is laid out in user
 * units and every colour comes from the theme tokens, so the diagram re-themes
 * with the rest of the page.
 *
 * Two drawings of the same flow, because a diagram is a layout and layouts don't
 * survive being scaled to a third of their width — the labels would shrink past
 * reading size. The wide one is a 3×3 grid; the narrow one is a single column
 * with the tooling bus moved to the left margin. Same nodes, same edges, same
 * description; only the geometry differs.
 *
 * The whole picture is one `role="img"` with a `<desc>`, so assistive tech gets
 * the flow as a sentence instead of two dozen loose text nodes — and gets the
 * same sentence at either size.
 */
import { useMediaQuery } from "../../hooks/useMediaQuery";
import styles from "./ecosystem.module.css";

/**
 * Below this the wide drawing no longer fits the docs column (it needs 672px of
 * canvas; the column supplies that from about 835px of viewport up), so it would
 * have to scroll sideways. Keep in sync with the `min-width` reset in
 * ecosystem.module.css.
 */
const NARROW_QUERY = "(max-width: 860px)";

type LineKind = "eyebrow" | "title" | "pkg" | "note";

interface Line {
  text: string;
  kind: LineKind;
}

/** Font size and leading per line kind, in user units. */
const METRICS: Record<LineKind, { size: number; lead: number }> = {
  eyebrow: { size: 10.5, lead: 16 },
  title: { size: 16, lead: 23 },
  pkg: { size: 12.5, lead: 19 },
  note: { size: 12, lead: 18 },
};

/* ── Node content ───────────────────────────────────────────────────────────
   Shared by both drawings, so the two can never drift apart in wording. */

const CONFIG_LINES: Line[] = [
  { text: "SINGLE SOURCE OF TRUTH", kind: "eyebrow" },
  { text: "Theme config", kind: "title" },
  { text: "@ui-organized/schema", kind: "pkg" },
];
const TOKENS_LINES: Line[] = [
  { text: "Design tokens", kind: "title" },
  { text: "@ui-organized/tokens", kind: "pkg" },
  { text: "CSS variables + typed exports", kind: "note" },
];
const UTILS_LINES: Line[] = [
  { text: "Generation utils", kind: "title" },
  { text: "@ui-organized/utils", kind: "pkg" },
  { text: "colour · type scale · spacing", kind: "note" },
];
const REACT_LINES: Line[] = [
  { text: "React components", kind: "title" },
  { text: "@ui-organized/react", kind: "pkg" },
  { text: "behaviour from Ark UI", kind: "note" },
];
const FIGMA_LINES: Line[] = [
  { text: "Figma plugin", kind: "title" },
  { text: "variables · modes · styles", kind: "note" },
];
const BUILDER_LINES: Line[] = [
  { text: "Theme builder", kind: "title" },
  { text: "pick, preview, export", kind: "note" },
];
const VITE_LINES: Line[] = [
  { text: "Vite plugin", kind: "title" },
  { text: "@ui-organized/react-vite", kind: "pkg" },
  { text: "builds & injects theme tokens", kind: "note" },
];

interface DiagramNodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  /** `source` is the config, `core` the pipeline, `tool` the dashed consumers. */
  tone?: "source" | "core" | "tool";
  /** Left padding from the box edge to the text. */
  inset?: number;
  lines: Line[];
}

/**
 * A labelled box. SVG has no text layout, so the lines are stacked from their
 * own metrics and the block is centred in the box — that keeps nodes with two
 * lines optically aligned with the three-line ones beside them.
 */
function DiagramNode({ x, y, w, h, tone = "core", inset = 22, lines }: DiagramNodeProps) {
  const block = lines.reduce((sum, line) => sum + METRICS[line.kind].lead, 0);
  let cursor = y + (h - block) / 2;

  return (
    <g className={styles.node} data-tone={tone}>
      <rect x={x} y={y} width={w} height={h} rx={12} className={styles.box} />
      {lines.map((line) => {
        const { size, lead } = METRICS[line.kind];
        const baseline = cursor + size * 0.78;
        cursor += lead;
        return (
          <text
            key={line.text}
            x={x + inset}
            y={baseline}
            fontSize={size}
            className={styles[line.kind]}
          >
            {line.text}
          </text>
        );
      })}
    </g>
  );
}

/** An orthogonal connector. `core` is the accented spine, `tool` the branch. */
function Edge({ d, tone = "core" }: { d: string; tone?: "core" | "tool" }) {
  return (
    <path
      d={d}
      className={styles.edge}
      data-tone={tone}
      markerEnd={`url(#eco-head-${tone})`}
    />
  );
}

/* ── Wide drawing ───────────────────────────────────────────────────────────
   One 900×408 canvas. Columns are shared by the pipeline row and the tooling
   row so the two grids line up; the Vite plugin sits directly under the
   components it feeds. */

const W = 900;
const H = 408;

/** Column x-origins, each 252 wide. */
const COL = [20, 324, 628];
const NODE_W = 252;

/** Row 1: the config. Row 2: the pipeline. Row 3: the tools. */
const CONFIG = { y: 8, h: 76 };
const CORE = { y: 132, h: 88 };
const TOOL = { y: 316, h: 80 };

/** Where the tooling bus runs, and the two verticals in/out of the Vite node. */
const BUS_Y = 268;
const VITE_IN = 700;
const VITE_OUT = 810;

const coreMid = CORE.y + CORE.h / 2;

function WideFlow() {
  return (
    <>
      {/* Config → tokens → utils → components: the accented spine. */}
      <Edge d={`M${COL[0] + 126} ${CONFIG.y + CONFIG.h} V${CORE.y}`} />
      <Edge d={`M${COL[0] + NODE_W} ${coreMid} H${COL[1]}`} />
      <Edge d={`M${COL[1] + NODE_W} ${coreMid} H${COL[2]}`} />

      {/* The tooling bus: one drop out of the tokens, three landings. */}
      <Edge d={`M${COL[0] + 126} ${CORE.y + CORE.h} V${TOOL.y}`} tone="tool" />
      <path
        d={`M${COL[0] + 126} ${BUS_Y} H${VITE_IN}`}
        className={styles.edge}
        data-tone="tool"
      />
      <Edge d={`M${COL[1] + 126} ${BUS_Y} V${TOOL.y}`} tone="tool" />
      <Edge d={`M${VITE_IN} ${BUS_Y} V${TOOL.y}`} tone="tool" />

      {/* …and back up: the Vite plugin injects the built tokens into the app. */}
      <Edge d={`M${VITE_OUT} ${TOOL.y} V${CORE.y + CORE.h}`} tone="tool" />

      <text x={COL[0] + 142} y={112} className={styles.edgeLabel}>
        Zod-validated shape
      </text>
      <text x={COL[0] + 142} y={252} className={styles.edgeLabel}>
        the same tokens drive every tool
      </text>

      <DiagramNode
        x={COL[0]}
        y={CONFIG.y}
        w={NODE_W}
        h={CONFIG.h}
        tone="source"
        lines={CONFIG_LINES}
      />

      <DiagramNode x={COL[0]} y={CORE.y} w={NODE_W} h={CORE.h} lines={TOKENS_LINES} />
      <DiagramNode x={COL[1]} y={CORE.y} w={NODE_W} h={CORE.h} lines={UTILS_LINES} />
      <DiagramNode x={COL[2]} y={CORE.y} w={NODE_W} h={CORE.h} lines={REACT_LINES} />

      <DiagramNode
        x={COL[0]}
        y={TOOL.y}
        w={NODE_W}
        h={TOOL.h}
        tone="tool"
        lines={FIGMA_LINES}
      />
      <DiagramNode
        x={COL[1]}
        y={TOOL.y}
        w={NODE_W}
        h={TOOL.h}
        tone="tool"
        lines={BUILDER_LINES}
      />
      <DiagramNode
        x={COL[2]}
        y={TOOL.y}
        w={NODE_W}
        h={TOOL.h}
        tone="tool"
        lines={VITE_LINES}
      />
    </>
  );
}

/* ── Narrow drawing ─────────────────────────────────────────────────────────
   One column, 360 units wide, so at a phone's column width a user unit is about
   a CSS pixel and the labels render at the sizes they were designed at. The
   pipeline runs straight down the middle; the tooling bus moves to the left
   margin and the Vite plugin's return line to the right, so neither crosses the
   spine. */

const N_W = 360;
const N_H = 714;

const N_X = 38;
const N_NODE_W = 288;
const N_INSET = 18;

/** Left margin: the tooling bus. Right margin: the Vite plugin's return. */
const N_BUS_X = 16;
const N_RETURN_X = 344;

const N_MID = N_X + N_NODE_W / 2;
const N_RIGHT = N_X + N_NODE_W;

/** Rows, top to bottom: the config, the three pipeline layers, the three tools. */
const N_CONFIG = { y: 8, h: 78 };
const N_TOKENS = { y: 126, h: 80 };
const N_UTILS = { y: 232, h: 80 };
const N_REACT = { y: 338, h: 80 };
const N_FIGMA = { y: 462, h: 62 };
const N_BUILDER = { y: 544, h: 62 };
const N_VITE = { y: 626, h: 80 };

const mid = (row: { y: number; h: number }) => row.y + row.h / 2;
const bottom = (row: { y: number; h: number }) => row.y + row.h;

function NarrowFlow() {
  return (
    <>
      {/* Config → tokens → utils → components, straight down the middle. */}
      <Edge d={`M${N_MID} ${bottom(N_CONFIG)} V${N_TOKENS.y}`} />
      <Edge d={`M${N_MID} ${bottom(N_TOKENS)} V${N_UTILS.y}`} />
      <Edge d={`M${N_MID} ${bottom(N_UTILS)} V${N_REACT.y}`} />

      {/* The tooling bus leaves the tokens sideways rather than downwards, so it
          reads as a branch off the spine instead of another step along it. */}
      <path
        d={`M${N_X} ${mid(N_TOKENS)} H${N_BUS_X} V${mid(N_VITE)}`}
        className={styles.edge}
        data-tone="tool"
      />
      <Edge d={`M${N_BUS_X} ${mid(N_FIGMA)} H${N_X}`} tone="tool" />
      <Edge d={`M${N_BUS_X} ${mid(N_BUILDER)} H${N_X}`} tone="tool" />
      <Edge d={`M${N_BUS_X} ${mid(N_VITE)} H${N_X}`} tone="tool" />

      {/* …and back up the right margin: the Vite plugin injects the built tokens
          into the app the components run in. */}
      <Edge
        d={`M${N_RIGHT} ${mid(N_VITE)} H${N_RETURN_X} V${mid(N_REACT)} H${N_RIGHT}`}
        tone="tool"
      />

      <text x={N_MID + 8} y={110} className={styles.edgeLabel}>
        Zod-validated shape
      </text>
      <text x={N_X} y={450} className={styles.edgeLabel}>
        the same tokens drive every tool
      </text>

      <DiagramNode
        x={N_X}
        y={N_CONFIG.y}
        w={N_NODE_W}
        h={N_CONFIG.h}
        tone="source"
        inset={N_INSET}
        lines={CONFIG_LINES}
      />

      <DiagramNode
        x={N_X}
        y={N_TOKENS.y}
        w={N_NODE_W}
        h={N_TOKENS.h}
        inset={N_INSET}
        lines={TOKENS_LINES}
      />
      <DiagramNode
        x={N_X}
        y={N_UTILS.y}
        w={N_NODE_W}
        h={N_UTILS.h}
        inset={N_INSET}
        lines={UTILS_LINES}
      />
      <DiagramNode
        x={N_X}
        y={N_REACT.y}
        w={N_NODE_W}
        h={N_REACT.h}
        inset={N_INSET}
        lines={REACT_LINES}
      />

      <DiagramNode
        x={N_X}
        y={N_FIGMA.y}
        w={N_NODE_W}
        h={N_FIGMA.h}
        tone="tool"
        inset={N_INSET}
        lines={FIGMA_LINES}
      />
      <DiagramNode
        x={N_X}
        y={N_BUILDER.y}
        w={N_NODE_W}
        h={N_BUILDER.h}
        tone="tool"
        inset={N_INSET}
        lines={BUILDER_LINES}
      />
      <DiagramNode
        x={N_X}
        y={N_VITE.y}
        w={N_NODE_W}
        h={N_VITE.h}
        tone="tool"
        inset={N_INSET}
        lines={VITE_LINES}
      />
    </>
  );
}

export function EcosystemDiagram() {
  const narrow = useMediaQuery(NARROW_QUERY);

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox={narrow ? `0 0 ${N_W} ${N_H}` : `0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="eco-title eco-desc"
      >
        <title id="eco-title">How the packages fit together</title>
        <desc id="eco-desc">
          A single theme config, validated by @ui-organized/schema, feeds the design
          tokens in @ui-organized/tokens. The tokens feed the generation utils in
          @ui-organized/utils, which feed the React components in @ui-organized/react,
          built on Ark UI. The same tokens also feed three tools: the Figma plugin, the
          theme builder, and the Vite plugin @ui-organized/react-vite, which builds and
          injects the tokens back into the app the components run in.
        </desc>

        <defs>
          {(["core", "tool"] as const).map((tone) => (
            <marker
              key={tone}
              id={`eco-head-${tone}`}
              viewBox="0 0 10 10"
              refX={10}
              refY={5}
              markerWidth={9}
              markerHeight={9}
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 Z" className={styles.head} data-tone={tone} />
            </marker>
          ))}
        </defs>

        {narrow ? <NarrowFlow /> : <WideFlow />}
      </svg>
    </figure>
  );
}
