import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@ui-organized/react';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToOklch,
  oklchToRgb,
  oklchToRgbGamutMapped,
  isOklchInGamut,
} from '../utils/colorConversions';

// Canvas render resolution (CSS-scaled to fill the container). Low enough to
// repaint instantly when the fixed channel (hue) changes, high enough to look
// smooth once the browser bilinear-scales it up.
const PLANE_W = 240;
const PLANE_H = 150;
const HUE_STEPS = 240;
// Practical maximum OKLCH chroma for the x-axis of the oklch plane. Beyond this
// almost everything is out of the sRGB gamut, so it would read as a flat band.
const CMAX = 0.37;

// A full-hue rainbow for the HSL hue strip (cheap CSS gradient; no canvas).
const HSL_HUE_GRADIENT =
  'linear-gradient(to right,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Two rendering modes share one interaction model. `oklch` maps chroma×lightness
// on the plane; everything else (hex/rgb/hsl) maps saturation×lightness. In both
// the hue is the "fixed" channel driven by the strip.
const modeFor = (fmt) => (fmt === 'oklch' ? 'oklch' : 'hsl');

// Decompose the active hex into the current mode's channels. `meaningful` marks
// whether the hue is well-defined (a near-grey has no reliable hue, so we keep
// the last one instead of snapping to red).
const deriveChannels = (hex, mode) => {
  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  if (mode === 'oklch') {
    const o = rgbToOklch(rgb.r, rgb.g, rgb.b);
    return { hue: o.h, x: clamp01(o.c / CMAX), y: clamp01(o.l), meaningful: o.c > 0.002 };
  }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hue: hsl.h, x: clamp01(hsl.s), y: clamp01(hsl.l), meaningful: hsl.s > 0.001 };
};

// Build a hex from plane coords (x,y in 0..1) + hue, for the active mode.
const composeHex = (mode, hue, x, y) => {
  if (mode === 'oklch') {
    const nr = oklchToRgbGamutMapped(y, x * CMAX, hue);
    return rgbToHex(nr.r, nr.g, nr.b);
  }
  const nr = hslToRgb(hue, x, y);
  return rgbToHex(nr.r, nr.g, nr.b);
};

/**
 * Interactive spectrum preview for the active swatch. Replaces the old static
 * colour block: a draggable 2-D plane shows where the colour sits, a hue strip
 * drives the third channel, and both re-render to match the selected display
 * format (HEX/RGB/HSL → saturation×lightness, OKLCH → chroma×lightness). An
 * Undo button reverts the last colour change.
 */
export default function SpectrumPicker({ color, format, onChange, onEditStart, onUndo, canUndo }) {
  const mode = modeFor(format);
  const chan = deriveChannels(color, mode);

  // Sticky hue: only follow the colour's hue while it is well-defined, so
  // dragging through greys (or up the saturation axis from a grey) doesn't lose
  // the hue the user was working with.
  const [hue, setHue] = useState(chan.hue);
  useEffect(() => {
    if (chan.meaningful) setHue(chan.hue);
  }, [chan.hue, chan.meaningful]);

  const planeRef = useRef(null);
  const hueRef = useRef(null);
  const planeCanvas = useRef(null);
  const hueCanvas = useRef(null);

  // Coalesce continuous drags to one emit per frame — the palette regenerates on
  // every colour change, so unthrottled pointermove would thrash it.
  const raf = useRef(0);
  const pending = useRef(null);
  const emit = (hex) => {
    pending.current = hex;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      if (pending.current != null) onChange(pending.current);
    });
  };
  useEffect(() => () => raf.current && cancelAnimationFrame(raf.current), []);

  // ── Plane background (fixed hue) ───────────────────────────────────────────
  useEffect(() => {
    const canvas = planeCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(PLANE_W, PLANE_H);
    const d = img.data;
    for (let yy = 0; yy < PLANE_H; yy++) {
      const y = 1 - yy / (PLANE_H - 1); // top = light/high, bottom = dark
      for (let xx = 0; xx < PLANE_W; xx++) {
        const x = xx / (PLANE_W - 1);
        const i = (yy * PLANE_W + xx) * 4;
        if (mode === 'oklch') {
          // Colours past the sRGB boundary can't be shown on the display, so
          // instead of gamut-mapping them (which hides the boundary) we black out
          // the region — only the lit area is selectable (see helper text below).
          if (isOklchInGamut(y, x * CMAX, hue)) {
            const { r, g, b } = oklchToRgb(y, x * CMAX, hue);
            d[i] = r * 255;
            d[i + 1] = g * 255;
            d[i + 2] = b * 255;
          } else {
            d[i] = d[i + 1] = d[i + 2] = 0;
          }
        } else {
          const { r, g, b } = hslToRgb(hue, x, y);
          d[i] = r * 255;
          d[i + 1] = g * 255;
          d[i + 2] = b * 255;
        }
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [hue, mode]);

  // ── Hue strip (only needs a canvas in oklch mode; HSL uses a CSS gradient) ──
  useEffect(() => {
    if (mode !== 'oklch') return;
    const canvas = hueCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(HUE_STEPS, 1);
    const d = img.data;
    for (let xx = 0; xx < HUE_STEPS; xx++) {
      const h = (xx / (HUE_STEPS - 1)) * 360;
      const { r, g, b } = oklchToRgbGamutMapped(0.7, 0.15, h);
      const i = xx * 4;
      d[i] = r * 255;
      d[i + 1] = g * 255;
      d[i + 2] = b * 255;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [mode]);

  // ── Pointer dragging ───────────────────────────────────────────────────────
  const dragPlane = (e) => {
    const el = planeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = 1 - clamp01((e.clientY - rect.top) / rect.height);
    emit(composeHex(mode, hue, x, y));
  };
  const dragHue = (e) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = clamp01((e.clientX - rect.left) / rect.width) * 360;
    setHue(h);
    emit(composeHex(mode, h, chan.x, chan.y));
  };
  const startDrag = (handler) => (e) => {
    e.preventDefault();
    // Capture the DOM node now: React nulls the synthetic event's currentTarget
    // after dispatch, so the deferred pointerup handler can't read it. Missing
    // this both throws and leaks the pointermove listener (plane keeps tracking
    // the cursor after release).
    const node = e.currentTarget;
    onEditStart?.(); // mark a fresh gesture so this drag is one undo step
    node.setPointerCapture?.(e.pointerId);
    handler(e);
    const move = (ev) => handler(ev);
    const up = (ev) => {
      node.releasePointerCapture?.(ev.pointerId);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', up);
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
  };

  const axisLabels = useMemo(
    () =>
      mode === 'oklch'
        ? { x: 'Chroma', y: 'Lightness' }
        : { x: 'Saturation', y: 'Lightness' },
    [mode],
  );

  const thumbBase = {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.4)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', flexShrink: 0 }}>
      {/* 2-D plane */}
      <div
        ref={planeRef}
        onPointerDown={startDrag(dragPlane)}
        role="slider"
        aria-label={`${axisLabels.x} and ${axisLabels.y}`}
        tabIndex={0}
        style={{
          position: 'relative',
          width: '100%',
          height: 150,
          borderRadius: 'var(--radius-interactive)',
          border: '1px solid var(--color-border-primary)',
          overflow: 'hidden',
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={planeCanvas}
          width={PLANE_W}
          height={PLANE_H}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
        <div
          style={{
            ...thumbBase,
            left: `${chan.x * 100}%`,
            top: `${(1 - chan.y) * 100}%`,
            background: color,
          }}
        />
      </div>

      {/* Hue strip + undo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <div
          ref={hueRef}
          onPointerDown={startDrag(dragHue)}
          role="slider"
          aria-label="Hue"
          aria-valuenow={Math.round(hue)}
          aria-valuemin={0}
          aria-valuemax={360}
          tabIndex={0}
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            height: 16,
            borderRadius: 999,
            border: '1px solid var(--color-border-primary)',
            overflow: 'hidden',
            cursor: 'ew-resize',
            touchAction: 'none',
            background: mode === 'oklch' ? undefined : HSL_HUE_GRADIENT,
          }}
        >
          {mode === 'oklch' && (
            <canvas
              ref={hueCanvas}
              width={HUE_STEPS}
              height={1}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          )}
          <div
            style={{
              ...thumbBase,
              width: 14,
              height: 14,
              left: `${(hue / 360) * 100}%`,
              top: '50%',
              background: `hsl(${hue}, 90%, 50%)`,
            }}
          />
        </div>

        <Button
          intent="secondary"
          size="lg"
          icon="undo"
          title="Undo last color change"
          aria-label="Undo last color change"
          disabled={!canUndo}
          onClick={onUndo}
        />
      </div>

      {/* OKLCH can describe more colours than a screen can show. The black area
          is out of the sRGB range your display supports, so it isn't selectable
          — which is why the spectrum doesn't fill the whole box. */}
      {mode === 'oklch' && (
        <p
          style={{
            margin: 0,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: 1.3,
            color: 'var(--color-text-tertiary)',
          }}
        >
          Black areas are OKLCH colors outside the sRGB range your display can
          show, so only the lit region is selectable.
        </p>
      )}
    </div>
  );
}
