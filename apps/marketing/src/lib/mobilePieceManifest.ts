/**
 * The mobile hero build (feedback): a bespoke phone screen the pieces assemble
 * into, instead of the desktop dashboard scaled down. Same falling → assembling
 * animation, driven by the same engine — this manifest just gives it a portrait
 * phone frame and a mobile-app layout of `@ui-organized/react` components.
 *
 * Coordinates are in *frame units* (px at scale S=1) inside a 380×800 phone
 * canvas, laid out as a single scroll-free column with 20px side gutters
 * (content x 20→360, width 340, full-width center cx=190). The top 48 units are
 * the phone's static status bar (drawn by AppFrame), so content starts below it.
 * The engine assembles pieces straight onto these slots (no desktop reflow).
 */

import type { HeroManifest, PieceDef } from "./pieceManifest";

/** Portrait phone canvas — tall and narrow. Top 48u is the status bar. */
export const FRAME_W_MOBILE = 380;
export const FRAME_H_MOBILE = 800;

const CX = 190; // full-width piece center
const W_FULL = 340; // full-width piece width (frame minus 20px gutters)

export const PIECES_MOBILE: PieceDef[] = [
  // ---- header: greeting left, status + avatar right (below the status bar) --
  { id: "m-heading", kind: "heading", w: 150, h: 36, shape: "rect", cx: 95, cy: 82, label: "Welcome!" },
  { id: "m-badge", kind: "badge", w: 74, h: 28, shape: "rect", cx: 286, cy: 82, label: "Active" },
  { id: "m-avatar", kind: "avatar", w: 40, h: 40, shape: "circle", cx: 340, cy: 82, label: "Avery Doe" },
  // ---- search ------------------------------------------------------------
  { id: "m-search", kind: "search", w: W_FULL, h: 44, shape: "rect", cx: CX, cy: 142 },
  // ---- stat tiles (two across) -------------------------------------------
  { id: "m-stat-1", kind: "stat", w: 162, h: 92, shape: "rect", cx: 101, cy: 220, value: "48", label: "Components" },
  { id: "m-stat-2", kind: "stat", w: 162, h: 92, shape: "rect", cx: 279, cy: 220, value: "$0", label: "Open Source" },
  // ---- form controls -----------------------------------------------------
  { id: "m-select", kind: "select", w: W_FULL, h: 54, shape: "rect", cx: CX, cy: 308, label: "Theme" },
  { id: "m-range", kind: "range", w: W_FULL, h: 54, shape: "rect", cx: CX, cy: 372, label: "Adjust" },
  { id: "m-toggle", kind: "toggle", w: 190, h: 30, shape: "rect", cx: 115, cy: 434, label: "Notifications" },
  { id: "m-meter", kind: "meter", w: W_FULL, h: 44, shape: "rect", cx: CX, cy: 490, label: "Storage used" },
  { id: "m-banner", kind: "banner", w: W_FULL, h: 44, shape: "rect", cx: CX, cy: 546, label: "Synced" },
  // ---- primary CTA + notes ----------------------------------------------
  { id: "m-btn", kind: "btn-primary", w: W_FULL, h: 48, shape: "rect", cx: CX, cy: 608, label: "Get Started" },
  { id: "m-textarea", kind: "textarea", w: W_FULL, h: 84, shape: "rect", cx: CX, cy: 688, label: "Notes" },
  // ---- bottom tab bar ----------------------------------------------------
  { id: "m-tabbar", kind: "tabbar", w: W_FULL, h: 56, shape: "rect", cx: CX, cy: 760 },
];

export const MOBILE_MANIFEST: HeroManifest = {
  variant: "mobile",
  frameW: FRAME_W_MOBILE,
  frameH: FRAME_H_MOBILE,
  pieces: PIECES_MOBILE,
  reflow: false,
  // Fill more of the phone viewport than the wide desktop frame does — the phone
  // is the hero, with the tucked title above and the caption below.
  widthFactor: 0.92,
  heightFactor: 0.68,
};
