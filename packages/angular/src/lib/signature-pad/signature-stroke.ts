/**
 * Turning pointer samples into a signature stroke, written out by hand.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * React, Svelte and Vue get their stroke geometry from `@zag-js/signature-pad`,
 * which bundles **perfect-freehand** — a published algorithm for pressure-aware
 * freehand outlines. This package has no zag and may take no third-party
 * dependency beyond the CDK, so the choice is between writing the geometry and
 * shipping a pad that records nothing.
 *
 * ── What this is NOT ────────────────────────────────────────────────────────
 *
 * It is **not** perfect-freehand, and it does not try to be. That algorithm's
 * look comes from a specific set of choices — a tapered start and end, a
 * velocity model when pressure is simulated, corner detection that inserts extra
 * points on sharp turns — and reproducing it from the outside would be guessing
 * at a shape rather than porting a spec. A signature drawn here will not be
 * pixel-identical to one drawn in the React component.
 *
 * That is stated rather than hidden because it is *checkable* how much it
 * matters: the `d` attribute is not part of the DOM contract the parity gate
 * compares (`isContractAttribute` in `tooling/parity/src/contract.ts` covers
 * `id`, `role`, `type`, `disabled`, `hidden`, `aria-*` and `data-*`, and `d` is
 * none of them). What *is* contract — one `segment-path` per stroke, the paths
 * the hidden input submits, `data-part` on each — is identical, and the parity
 * gate holds it to that. The ink's shape is a rendering difference between two
 * hand-drawing algorithms, not a difference in what either library promises.
 *
 * ── The algorithm, and where each part comes from ───────────────────────────
 *
 * The model is the standard one for variable-width digital ink, and every
 * constant below is named rather than tuned by eye:
 *
 *  1. **Streamline** — raw pointer samples are noisy and arrive unevenly. Each
 *     sample is folded into the previous accepted point with an exponential
 *     filter, `p = prev + (raw − prev)·t`. This is a one-pole IIR low-pass, the
 *     same filter every drawing tool uses for this; `streamline` names how much
 *     of the previous point survives.
 *  2. **Radius** — the half-width at a point, from the stylus pressure:
 *     `r = (size / 2)·(1 − thinning + thinning·pressure)`. At `thinning: 0` the
 *     stroke is a constant-width ribbon; at `thinning: 1` its width is
 *     proportional to pressure. Both endpoints are exact, which is what the spec
 *     asserts.
 *  3. **Outline** — the stroke is a *filled* shape, not a stroked line, because
 *     `SignaturePad.css` colours it with `fill`. Each point contributes two
 *     offset points, `±r` along the normal of the local tangent; the tangent at
 *     an interior point is the sum of its two neighbouring segment directions,
 *     which is the standard miter-free join and cannot fold the ribbon inside
 *     out on a sharp corner the way a per-segment normal does.
 *  4. **Caps** — a semicircular fan at each end, so a stroke ends in a round nib
 *     rather than a chisel. A single sample with nowhere to go is a full circle,
 *     which is what a dot on the page is.
 *  5. **Path** — the outline is emitted as quadratic curves through the
 *     midpoints of consecutive vertices, the standard way to draw a smooth
 *     closed polygon without solving for control points, and closed with `Z` so
 *     `fill` has something to fill. `smoothing: 0` emits straight segments
 *     instead.
 *
 * The spec proves it against values computed by hand rather than against
 * itself: a straight horizontal line at constant pressure has to produce a
 * ribbon whose extreme ordinates are exactly `±r`, a single point has to produce
 * a circle of radius `r`, and the two thinning endpoints have to produce
 * radii `(size/2)(1 − thinning)` and `size/2`.
 */

export interface SignaturePoint {
  x: number;
  y: number;
  /** 0–1, as `PointerEvent.pressure` reports it. */
  pressure?: number;
}

export interface SignatureStrokeOptions {
  /** Full stroke width in pixels at full pressure. zag's `drawing.size`. */
  size?: number;
  /** How much of the width follows the pressure, 0–1. zag's `drawing.thinning`. */
  thinning?: number;
  /** How rounded the outline is, 0–1. zag's `drawing.smoothing`. */
  smoothing?: number;
  /** How much of the previous point survives each sample, 0–1. */
  streamline?: number;
  /**
   * Derive the pressure from the pointer's speed rather than reading it.
   *
   * zag defaults this to `false`, which is the opposite of perfect-freehand's
   * own default, and the reason a mouse-drawn signature is an even ribbon: a
   * mouse reports `pressure: 0.5` throughout.
   */
  simulatePressure?: boolean;
}

/** zag's `drawing` defaults, which are the machine's rather than this file's. */
export const SIGNATURE_STROKE_DEFAULTS: Required<SignatureStrokeOptions> = {
  size: 2,
  thinning: 0.7,
  smoothing: 0.4,
  streamline: 0.6,
  simulatePressure: false,
};

/** Pressure a device that does not measure it reports while the tip is down. */
const UNMEASURED_PRESSURE = 0.5;

/**
 * Pointer speed, in pixels per sample, at which a simulated pressure reaches
 * zero. A fast flick thins to nothing; anything slower tapers proportionally.
 */
const MAX_SIMULATED_SPEED = 24;

/** Segments in each end cap's semicircle. Eight reads as round at ink sizes. */
const CAP_SEGMENTS = 8;

/** Coordinates are rounded to this many places before being written into `d`. */
const PATH_PRECISION = 2;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Fold raw samples through a one-pole low-pass filter.
 *
 * `streamline` is the fraction of the previous point that survives, so 0 passes
 * the input through untouched and 1 would never move at all — hence the floor:
 * a filter that never reaches the pointer draws a stroke that lags behind the
 * hand and never catches up.
 */
export function smoothSignaturePoints(
  points: readonly SignaturePoint[],
  streamline: number,
): SignaturePoint[] {
  if (points.length === 0) return [];
  const t = Math.max(1 - clamp01(streamline), 0.15);
  const out: SignaturePoint[] = [{ ...points[0]! }];
  for (let i = 1; i < points.length; i++) {
    const raw = points[i]!;
    const prev = out[out.length - 1]!;
    out.push({
      x: prev.x + (raw.x - prev.x) * t,
      y: prev.y + (raw.y - prev.y) * t,
      pressure: raw.pressure,
    });
  }
  return out;
}

/**
 * The half-width at each point.
 *
 * Exported so the spec can hold the two thinning endpoints against numbers
 * worked out by hand rather than against the outline they end up in.
 */
export function signatureRadii(
  points: readonly SignaturePoint[],
  options: Required<SignatureStrokeOptions>,
): number[] {
  const half = options.size / 2;
  const thinning = clamp01(options.thinning);
  return points.map((point, index) => {
    const pressure = options.simulatePressure
      ? simulatedPressure(points, index)
      : clamp01(point.pressure ?? UNMEASURED_PRESSURE);
    return half * (1 - thinning + thinning * pressure);
  });
}

/** Fast strokes are light, slow ones heavy — the usual velocity model. */
function simulatedPressure(points: readonly SignaturePoint[], index: number): number {
  const previous = points[index - 1];
  if (!previous) return UNMEASURED_PRESSURE;
  const point = points[index]!;
  const speed = Math.hypot(point.x - previous.x, point.y - previous.y);
  return clamp01(1 - speed / MAX_SIMULATED_SPEED);
}

/**
 * The closed polygon around a stroke: one side out, a cap, the other side back,
 * and a cap.
 *
 * Duplicate consecutive samples are dropped first. They arrive whenever a
 * pointer reports without moving, and a zero-length segment has no direction, so
 * leaving them in puts a `NaN` normal into the outline and the whole path
 * disappears.
 */
export function signatureOutline(
  points: readonly SignaturePoint[],
  options: SignatureStrokeOptions = {},
): { x: number; y: number }[] {
  const resolved = { ...SIGNATURE_STROKE_DEFAULTS, ...options };
  const smoothed = dedupe(smoothSignaturePoints(points, resolved.streamline));
  if (smoothed.length === 0) return [];
  const radii = signatureRadii(smoothed, resolved);

  if (smoothed.length === 1) {
    return circle(smoothed[0]!, radii[0]!);
  }

  const normals = tangentNormals(smoothed);
  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let i = 0; i < smoothed.length; i++) {
    const point = smoothed[i]!;
    const normal = normals[i]!;
    const radius = radii[i]!;
    left.push({ x: point.x + normal.x * radius, y: point.y + normal.y * radius });
    right.push({ x: point.x - normal.x * radius, y: point.y - normal.y * radius });
  }

  const last = smoothed.length - 1;
  return [
    ...left,
    // Round the far end, turning from the left side onto the right one.
    ...cap(smoothed[last]!, normals[last]!, radii[last]!, false),
    ...right.reverse(),
    // …and the near end, closing the shape back onto the first left point.
    ...cap(smoothed[0]!, normals[0]!, radii[0]!, true),
  ];
}

/** The signed unit normal at each point, from the average of its two tangents. */
function tangentNormals(points: readonly SignaturePoint[]): { x: number; y: number }[] {
  const normals: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const before = points[i - 1] ?? points[i]!;
    const after = points[i + 1] ?? points[i]!;
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    // Rotate the tangent a quarter turn: (dx, dy) -> (-dy, dx).
    normals.push({ x: -dy / length, y: dx / length });
  }
  return normals;
}

/**
 * A semicircle around one end, joining the two sides of the ribbon.
 *
 * The offsets sit at the normal's angle `n` (left) and `n + π` (right), and the
 * direction of travel is at `n − π/2` — the normal is the tangent turned a
 * quarter turn, so the tangent is the normal turned back. Sweeping by **−π**
 * therefore passes through the travel direction rather than back over the
 * stroke, which is the difference between a round nib and a cap folded inside
 * the ink. The far cap starts at `n`; the near one starts half a turn round, at
 * `n + π`, because the loop arrives there from the returning side.
 */
function cap(
  point: SignaturePoint,
  normal: { x: number; y: number },
  radius: number,
  atStart: boolean,
): { x: number; y: number }[] {
  const from = Math.atan2(normal.y, normal.x) + (atStart ? Math.PI : 0);
  const out: { x: number; y: number }[] = [];
  for (let step = 1; step < CAP_SEGMENTS; step++) {
    const angle = from - Math.PI * (step / CAP_SEGMENTS);
    out.push({ x: point.x + Math.cos(angle) * radius, y: point.y + Math.sin(angle) * radius });
  }
  return out;
}

/** A dot: a stroke that never moved is a full circle, not an empty path. */
function circle(point: SignaturePoint, radius: number): { x: number; y: number }[] {
  const steps = CAP_SEGMENTS * 2;
  return Array.from({ length: steps }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2;
    return { x: point.x + Math.cos(angle) * radius, y: point.y + Math.sin(angle) * radius };
  });
}

function dedupe(points: readonly SignaturePoint[]): SignaturePoint[] {
  const out: SignaturePoint[] = [];
  for (const point of points) {
    const previous = out[out.length - 1];
    if (previous && previous.x === point.x && previous.y === point.y) continue;
    out.push(point);
  }
  return out;
}

const round = (value: number) => Number(value.toFixed(PATH_PRECISION));

/**
 * The closed outline as SVG path data.
 *
 * Quadratic curves through the midpoints of consecutive vertices: each vertex
 * becomes a control point and each midpoint an on-curve point, which is the
 * cheapest way to draw a smooth closed polygon and needs no control-point
 * solving. `smoothing: 0` emits straight segments instead, for a caller who
 * wants the polygon itself.
 */
export function signaturePathData(
  outline: readonly { x: number; y: number }[],
  smoothing = SIGNATURE_STROKE_DEFAULTS.smoothing,
): string {
  if (outline.length === 0) return "";
  if (outline.length < 3) {
    return `M ${round(outline[0]!.x)} ${round(outline[0]!.y)} Z`;
  }
  if (smoothing <= 0) {
    const [first, ...rest] = outline;
    return (
      `M ${round(first!.x)} ${round(first!.y)} ` +
      rest.map((point) => `L ${round(point.x)} ${round(point.y)}`).join(" ") +
      " Z"
    );
  }

  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  const start = mid(outline[outline.length - 1]!, outline[0]!);
  let d = `M ${round(start.x)} ${round(start.y)}`;
  for (let i = 0; i < outline.length; i++) {
    const control = outline[i]!;
    const end = mid(control, outline[(i + 1) % outline.length]!);
    d += ` Q ${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`;
  }
  return `${d} Z`;
}

/** The whole pipeline: samples in, one stroke's path data out. */
export function signatureStroke(
  points: readonly SignaturePoint[],
  options: SignatureStrokeOptions = {},
): string {
  const resolved = { ...SIGNATURE_STROKE_DEFAULTS, ...options };
  return signaturePathData(signatureOutline(points, resolved), resolved.smoothing);
}
