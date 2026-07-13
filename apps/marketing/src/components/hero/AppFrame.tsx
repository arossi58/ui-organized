import { forwardRef } from "react";
import "./app-frame.css";

interface AppFrameProps {
  /** Which shell to draw — the desktop dashboard window or the phone screen. */
  variant?: "desktop" | "mobile";
  /** The mockup canvas size in frame units (from the active manifest). */
  frameW: number;
  frameH: number;
}

/**
 * The window the pieces assemble into. On desktop it's the dashboard window
 * (Figma node 142:8348) — an empty rounded surface plus the static content-panel
 * backing the control pieces settle onto. On mobile it's a phone screen: a
 * rounded portrait device with a slim status bar; the mobile pieces
 * (mobilePieceManifest) rain in and assemble on top of it.
 *
 * The window is just the *container* — every actual UI element falls in as a
 * physics piece (see the manifests / PieceLayer). Colour comes from the DS
 * semantic tokens, so the mockup follows the site's global theme. The mockup is
 * laid out in frame units (frameW×frameH) and scaled to the viewport by
 * `--frame-scale`, which the engine sets alongside size/position/opacity.
 *
 * While arranging (`.is-gridding`, desktop only) the `__portal` reveals the dot
 * lattice pieces snap to. Decorative.
 */
export const AppFrame = forwardRef<HTMLDivElement, AppFrameProps>(function AppFrame(
  { variant = "desktop", frameW, frameH },
  ref,
) {
  const mobile = variant === "mobile";
  return (
    <div
      className={`app-frame${mobile ? " app-frame--mobile" : ""}`}
      ref={ref}
      aria-hidden="true"
    >
      <div className="app-frame__mockup" style={{ width: frameW, height: frameH }}>
        {mobile ? (
          // Phone status bar — the only static chrome; the app UI rains in.
          <div className="app-frame__statusbar">
            <span className="app-frame__clock">9:41</span>
            <span className="app-frame__signal" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : (
          // Static backing (a container, not a physics body) the control pieces
          // settle onto; the rest of the dashboard rains in as pieces on top.
          <div className="app-frame__content" />
        )}
      </div>

      <div className="app-frame__portal" />
    </div>
  );
});
