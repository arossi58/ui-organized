/**
 * The hero pieces (SITE.md §5). Sizes and slot centers are in *frame units* —
 * pixels at scale S=1 inside the app-frame coordinate space (FRAME_W×FRAME_H).
 * The engine scales them by S for the actual viewport. `kind` selects which
 * `@ui-organized/react` component the PieceLayer renders; `shape` drives the matter-js body.
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
export const FRAME_H = 700;

export type PieceShape = "rect" | "circle";

export type PieceKind =
  | "input"
  | "select"
  | "range"
  | "checks"
  | "btn-primary"
  | "btn-secondary"
  | "dialog"
  | "banner"
  | "radios"
  | "toggle"
  | "textarea"
  | "meter"
  | "pagination"
  | "tabs"
  | "search"
  // Dashboard chrome that now falls/assembles as pieces too (the window and the
  // content-panel backing stay as static containers — see AppFrame).
  | "sidebar"
  | "heading"
  | "badge"
  | "stat"
  // The account avatar, pinned to the far right of the header.
  | "avatar";

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
  // The full-height nav rail and the four stat cards. Only the window and the
  // content-panel backing stay static.
  { id: "sidebar", kind: "sidebar", w: 240, h: 700, shape: "rect", cx: 120, cy: 350 },
  { id: "stat-1", kind: "stat", w: 210, h: 96, shape: "rect", cx: 369, cy: 150, value: "105", label: "Components" },
  { id: "stat-2", kind: "stat", w: 210, h: 96, shape: "rect", cx: 603, cy: 150, value: "5", label: "Figma Plugins" },
  { id: "stat-3", kind: "stat", w: 210, h: 96, shape: "rect", cx: 837, cy: 150, value: "$0", label: "Open Source 4-ever" },
  { id: "stat-4", kind: "stat", w: 210, h: 96, shape: "rect", cx: 1071, cy: 150, value: "Fully", label: "Customizable" },
  // ---- header band --------------------------------------------------------
  // Greeting on the left; the account cluster (status badge + avatar) pinned to
  // the far right, the avatar last and the badge 16px to its left.
  { id: "heading", kind: "heading", w: 160, h: 40, shape: "rect", cx: 344, cy: 46, label: "Welcome!" },
  { id: "badge", kind: "badge", w: 72, h: 28, shape: "rect", cx: 1084, cy: 46, label: "Active" },
  { id: "avatar", kind: "avatar", w: 40, h: 40, shape: "circle", cx: 1156, cy: 46, label: "Avery Doe" },
  // ---- left content column (tabs + form controls) -------------------------
  { id: "tabs", kind: "tabs", w: 424, h: 36, shape: "rect", cx: 492, cy: 258 },
  { id: "input", kind: "input", w: 424, h: 54, shape: "rect", cx: 492, cy: 312, label: "Input" },
  { id: "select", kind: "select", w: 424, h: 54, shape: "rect", cx: 492, cy: 374, label: "Select" },
  { id: "range", kind: "range", w: 424, h: 54, shape: "rect", cx: 492, cy: 436, label: "Slider" },
  { id: "checks", kind: "checks", w: 140, h: 34, shape: "rect", cx: 352, cy: 492, label: "Checkbox" },
  { id: "btn-primary", kind: "btn-primary", w: 80, h: 40, shape: "rect", cx: 320, cy: 550, label: "Button" },
  { id: "btn-secondary", kind: "btn-secondary", w: 80, h: 40, shape: "rect", cx: 416, cy: 550, label: "Button" },
  { id: "dialog", kind: "dialog", w: 92, h: 40, shape: "rect", cx: 520, cy: 550, label: "Open" },
  { id: "pagination", kind: "pagination", w: 424, h: 32, shape: "rect", cx: 492, cy: 606 },
  // ---- right content column (search + feedback/data) ----------------------
  { id: "search", kind: "search", w: 424, h: 40, shape: "rect", cx: 948, cy: 260 },
  { id: "banner", kind: "banner", w: 424, h: 40, shape: "rect", cx: 948, cy: 312, label: "Message" },
  { id: "radios", kind: "radios", w: 67, h: 70, shape: "rect", cx: 769, cy: 386, label: "Radio" },
  { id: "toggle", kind: "toggle", w: 93, h: 24, shape: "rect", cx: 782, cy: 446, label: "Toggle" },
  { id: "meter", kind: "meter", w: 424, h: 40, shape: "rect", cx: 948, cy: 498, label: "Storage used" },
  { id: "textarea", kind: "textarea", w: 424, h: 88, shape: "rect", cx: 948, cy: 596, label: "Text Area" },
];
