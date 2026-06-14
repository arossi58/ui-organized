/**
 * The hero pieces (SITE.md §5). Sizes and slot centers are in *frame units* —
 * pixels at scale S=1 inside the app-frame coordinate space (FRAME_W×FRAME_H).
 * The engine scales them by S for the actual viewport. `kind` selects which
 * `@ds/react` component the PieceLayer renders; `shape` drives the matter-js body.
 *
 * The assembled "app" reproduces the Branding dashboard mockup (Figma node
 * 142:8348): a dark product UI built entirely from the library. The *shell* —
 * the dark window, the sidebar, the header, the stat cards, and the content
 * panel — is static chrome rendered by `AppFrame`. The *interactive controls*
 * that fill the content panel are the falling pieces defined here: they rain in,
 * assemble into the panel, then go live (clickable, draggable) like the rest of
 * the demo. Coordinates are taken straight from the Figma mockup (1200×640) so
 * the pieces land where the mockup places them.
 */

// The mockup's own coordinate space (Figma node 142:8348) — 1200×640, the
// Branding mockup's exact frame. The engine caps the render scale at S=1, so
// this doubles as the mockup's max size (1200px wide × 640px tall). Pieces use
// these units directly, and AppFrame renders its shell at the same scale.
export const FRAME_W = 1200;
export const FRAME_H = 640;

export type PieceShape = "rect" | "circle";

export type PieceKind =
  | "input"
  | "select"
  | "range"
  | "checks"
  | "btn-primary"
  | "btn-secondary"
  | "banner"
  | "radios"
  | "toggle"
  | "textarea"
  // Dashboard chrome that now falls/assembles as pieces too (the window and the
  // content-panel backing stay as static containers — see AppFrame).
  | "sidebar"
  | "heading"
  | "badge"
  | "stat";

export interface PieceDef {
  id: string;
  kind: PieceKind;
  /** Frame-unit size (px at S=1). */
  w: number;
  h: number;
  shape: PieceShape;
  /** Organized slot center, in frame units. */
  cx: number;
  cy: number;
  /** Visible label, where the visual carries text. */
  label?: string;
  /** Secondary text for pieces that carry two strings (e.g. a stat's figure). */
  value?: string;
}

// Geometry mirrors the Figma mockup (1200×640). The 240px sidebar + 24px body
// padding put the content panel at x=264, y=226; its two 424px-wide columns
// start at x=280 (left) and x=736 (right), 16px inside the panel. Above the
// panel sit the header (heading + badge) and the stat-card row — all now pieces.
export const PIECES: PieceDef[] = [
  // ---- dashboard chrome (was static shell; now physics pieces) -------------
  // The full-height nav rail, the header heading + status badge, and the four
  // stat cards. Only the window and the content-panel backing stay static.
  { id: "sidebar", kind: "sidebar", w: 240, h: 640, shape: "rect", cx: 120, cy: 320 },
  { id: "heading", kind: "heading", w: 160, h: 40, shape: "rect", cx: 344, cy: 44, label: "Welcome!" },
  { id: "badge", kind: "badge", w: 72, h: 28, shape: "rect", cx: 1140, cy: 44, label: "Active" },
  { id: "stat-1", kind: "stat", w: 210, h: 96, shape: "rect", cx: 369, cy: 150, value: "105", label: "Components" },
  { id: "stat-2", kind: "stat", w: 210, h: 96, shape: "rect", cx: 603, cy: 150, value: "5", label: "Figma Plugins" },
  { id: "stat-3", kind: "stat", w: 210, h: 96, shape: "rect", cx: 837, cy: 150, value: "$0", label: "Open Source 4-ever" },
  { id: "stat-4", kind: "stat", w: 210, h: 96, shape: "rect", cx: 1071, cy: 150, value: "Fully", label: "Customizable" },
  // ---- left content column ------------------------------------------------
  { id: "input", kind: "input", w: 424, h: 58, shape: "rect", cx: 492, cy: 271, label: "Input" },
  { id: "select", kind: "select", w: 424, h: 58, shape: "rect", cx: 492, cy: 339, label: "Select" },
  { id: "range", kind: "range", w: 424, h: 58, shape: "rect", cx: 492, cy: 407, label: "Slider" },
  { id: "checks", kind: "checks", w: 97, h: 104, shape: "rect", cx: 328, cy: 498, label: "Checkbox" },
  { id: "btn-primary", kind: "btn-primary", w: 80, h: 40, shape: "rect", cx: 320, cy: 580, label: "Button" },
  { id: "btn-secondary", kind: "btn-secondary", w: 80, h: 40, shape: "rect", cx: 416, cy: 580, label: "Button" },
  // ---- right content column -----------------------------------------------
  { id: "banner", kind: "banner", w: 424, h: 40, shape: "rect", cx: 948, cy: 262, label: "Message" },
  { id: "radios", kind: "radios", w: 67, h: 70, shape: "rect", cx: 769, cy: 337, label: "Radio" },
  { id: "toggle", kind: "toggle", w: 93, h: 24, shape: "rect", cx: 782, cy: 404, label: "Toggle" },
  { id: "textarea", kind: "textarea", w: 424, h: 160, shape: "rect", cx: 948, cy: 520, label: "Text Area" },
];
