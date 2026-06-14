import { forwardRef } from "react";
import { FRAME_W, FRAME_H } from "../../lib/pieceManifest";
import "./app-frame.css";

/**
 * The dashboard window the pieces assemble into (Figma node 142:8348). Per the
 * latest feedback the window is now just the *container*: an empty rounded
 * surface (border + shadow) plus the static content-panel backing the control
 * pieces settle onto. Every actual element of the dashboard — the sidebar, the
 * "Welcome!" heading, the status badge, the four stat cards, and the form
 * controls — falls in as a physics piece (see pieceManifest / PieceLayer); only
 * the section containers stay static here.
 *
 * Colour comes entirely from the DS semantic tokens, so the mockup follows the
 * site's single global theme (light, set once on <html>). The mockup is laid out
 * in Figma units (FRAME_W×FRAME_H) and scaled to the viewport by `--frame-scale`,
 * which the engine sets each measure alongside the window's size/position/opacity.
 *
 * While arranging (`.is-gridding`, set by the engine) the `__portal` reveals the
 * hero's dot lattice — the same grid the pieces snap to. Decorative.
 */
export const AppFrame = forwardRef<HTMLDivElement>(function AppFrame(_props, ref) {
  return (
    <div className="app-frame" ref={ref} aria-hidden="true">
      <div
        className="app-frame__mockup"
        style={{ width: FRAME_W, height: FRAME_H }}
      >
        {/* Static backing (a container, not a physics body) the control pieces
            settle onto; the rest of the dashboard rains in as pieces on top. */}
        <div className="app-frame__content" />
      </div>

      <div className="app-frame__portal" />
    </div>
  );
});
