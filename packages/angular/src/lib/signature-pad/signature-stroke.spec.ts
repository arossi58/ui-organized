import { describe, it, expect } from "vitest";
import {
  SIGNATURE_STROKE_DEFAULTS,
  signatureOutline,
  signaturePathData,
  signatureRadii,
  signatureStroke,
  smoothSignaturePoints,
  type SignaturePoint,
} from "./signature-stroke.js";

/**
 * The stroke geometry, against numbers worked out on paper.
 *
 * This algorithm has no reference implementation to be checked against — that
 * is the whole point of the file, which exists because `perfect-freehand` is a
 * dependency this package may not take. So it is proved the only honest way
 * available: by choosing inputs whose correct output can be derived by hand, and
 * asserting the derivation.
 *
 * A straight horizontal line at constant pressure is the case that pins almost
 * everything. Its ribbon has to be exactly `2r` tall and its round caps have to
 * reach exactly `r` past each end — which catches a normal computed from the
 * wrong axis, a radius that drifts with position, and a cap swept the wrong way
 * round (a bug that renders as a nib folded *into* the ink and is invisible in
 * any assertion that only checks the path is non-empty).
 */
const options = { ...SIGNATURE_STROKE_DEFAULTS, streamline: 0, smoothing: 0 };

/** Full pressure, so `thinning` cannot make the radius anything but `size / 2`. */
const line = (length: number, step = 10): SignaturePoint[] =>
  Array.from({ length: length / step + 1 }, (_, i) => ({ x: i * step, y: 0, pressure: 1 }));

const bounds = (points: readonly { x: number; y: number }[]) => ({
  minX: Math.min(...points.map((p) => p.x)),
  maxX: Math.max(...points.map((p) => p.x)),
  minY: Math.min(...points.map((p) => p.y)),
  maxY: Math.max(...points.map((p) => p.y)),
});

describe("smoothSignaturePoints", () => {
  it("passes the samples through untouched at streamline 0", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 4 },
    ];
    expect(smoothSignaturePoints(points, 0)).toEqual([
      { x: 0, y: 0, pressure: undefined },
      { x: 10, y: 4, pressure: undefined },
    ]);
  });

  /**
   * The filter floor. `streamline: 1` would mean "keep all of the previous
   * point", which is a stroke that never leaves the first sample; the floor of
   * 0.15 is what stops a caller from writing an ink that does not move.
   */
  it("still advances at streamline 1", () => {
    const smoothed = smoothSignaturePoints(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      1,
    );
    expect(smoothed[1]!.x).toBeCloseTo(1.5, 10);
  });

  it("moves a fixed fraction of the remaining distance each sample", () => {
    // t = 1 − 0.5 = 0.5, so each sample halves the gap: 0 → 8 → 12.
    const smoothed = smoothSignaturePoints(
      [
        { x: 0, y: 0 },
        { x: 16, y: 0 },
        { x: 16, y: 0 },
      ],
      0.5,
    );
    expect(smoothed.map((p) => p.x)).toEqual([0, 8, 12]);
  });
});

describe("signatureRadii", () => {
  it("hits both thinning endpoints exactly", () => {
    const points = [
      { x: 0, y: 0, pressure: 0 },
      { x: 1, y: 0, pressure: 1 },
    ];
    // size 10, thinning 0.7 → r = 5·(0.3 + 0.7·pressure). Compared to a
    // tolerance rather than exactly: 5·(1 − 0.7) is 1.5000000000000002 in binary
    // floating point, and a radius is a length rather than an identity.
    const radii = signatureRadii(points, { ...options, size: 10, thinning: 0.7 });
    expect(radii[0]).toBeCloseTo(1.5, 10);
    expect(radii[1]).toBe(5);
  });

  it("is a constant ribbon at thinning 0, whatever the pressure", () => {
    const points = [
      { x: 0, y: 0, pressure: 0 },
      { x: 1, y: 0, pressure: 1 },
    ];
    expect(signatureRadii(points, { ...options, size: 8, thinning: 0 })).toEqual([4, 4]);
  });

  it("assumes half pressure from a device that does not measure it", () => {
    // A mouse reports 0.5 while the button is down, and `undefined` is the same
    // claim from a device with no notion of pressure at all.
    expect(signatureRadii([{ x: 0, y: 0 }], { ...options, size: 10, thinning: 1 })).toEqual([2.5]);
  });
});

describe("signatureOutline", () => {
  /**
   * The derivation: a line along +x has tangent (1, 0), so its normal is (0, 1)
   * and the ribbon's edges are at y = ±r. The caps are semicircles about each
   * end, so the outline reaches r past x = 0 and x = 100.
   */
  it("is a ribbon of exactly the right width, with round ends", () => {
    const outline = signatureOutline(line(100), { ...options, size: 10, thinning: 0 });
    const box = bounds(outline);
    expect(box.minY).toBeCloseTo(-5, 10);
    expect(box.maxY).toBeCloseTo(5, 10);
    expect(box.minX).toBeCloseTo(-5, 10);
    expect(box.maxX).toBeCloseTo(105, 10);
  });

  it("scales with the ink width and nothing else", () => {
    const box = bounds(signatureOutline(line(100), { ...options, size: 2, thinning: 0 }));
    expect(box.maxY - box.minY).toBeCloseTo(2, 10);
  });

  /**
   * One vertex per side per sample, plus `CAP_SEGMENTS − 1` interior points in
   * each cap: 11 samples → 22 + 7 + 7 = 36.
   */
  it("has one vertex per side per sample, plus the caps", () => {
    expect(signatureOutline(line(100), options)).toHaveLength(36);
  });

  it("draws a lone sample as a full circle", () => {
    const outline = signatureOutline([{ x: 50, y: 20, pressure: 1 }], {
      ...options,
      size: 6,
      thinning: 0,
    });
    const box = bounds(outline);
    expect(box.maxX - box.minX).toBeCloseTo(6, 10);
    expect(box.maxY - box.minY).toBeCloseTo(6, 10);
    // Centred on the sample rather than starting from it.
    expect((box.minX + box.maxX) / 2).toBeCloseTo(50, 10);
    expect((box.minY + box.maxY) / 2).toBeCloseTo(20, 10);
  });

  /**
   * A pointer that reports without moving is normal, and a zero-length segment
   * has no direction — so a duplicate left in place puts a division by zero into
   * the normal and the whole stroke renders as nothing.
   */
  it("survives a pointer that reported twice from the same place", () => {
    const outline = signatureOutline(
      [
        { x: 0, y: 0, pressure: 1 },
        { x: 0, y: 0, pressure: 1 },
        { x: 10, y: 0, pressure: 1 },
      ],
      options,
    );
    expect(outline.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(
      true,
    );
  });

  it("has nothing to draw for no samples", () => {
    expect(signatureOutline([], options)).toEqual([]);
    expect(signatureStroke([], options)).toBe("");
  });
});

describe("signaturePathData", () => {
  it("closes the shape, because the ink is filled rather than stroked", () => {
    // `SignaturePad.css` colours `.signature-pad__segment` with `fill`, so an
    // unclosed path is an invisible signature.
    const d = signatureStroke(line(100), options);
    expect(d.startsWith("M ")).toBe(true);
    expect(d.endsWith(" Z")).toBe(true);
  });

  it("emits straight segments at smoothing 0 and curves above it", () => {
    const outline = signatureOutline(line(30), options);
    expect(signaturePathData(outline, 0)).toContain(" L ");
    expect(signaturePathData(outline, 0)).not.toContain(" Q ");
    expect(signaturePathData(outline, 0.4)).toContain(" Q ");
  });

  it("rounds coordinates rather than writing float noise into the DOM", () => {
    const d = signaturePathData([{ x: 1 / 3, y: 2 / 3 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 0);
    expect(d).not.toMatch(/\d\.\d{3,}/);
  });
});
