import { useEffect, useRef, type ComponentType, type Ref } from "react";
import UnicornScene, { type UnicornSceneProps } from "unicornstudio-react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";

// The scene-instance type isn't re-exported from the package root, so recover it
// from the `sceneRef` prop — it carries `paused`, which we drive imperatively.
type SceneInstance = NonNullable<UnicornSceneProps["sceneRef"]> extends Ref<infer S> ? S : never;

interface OverviewSceneProps {
  /** Whether the owning card is hovered/focused or its detail panel is open. */
  active: boolean;
  /** Scene file basename under `public/webgl/` (e.g. "design-card"). */
  file: string;
  /**
   * Static SVG art rendered while the WebGL scene loads, on error, or when the
   * browser can't run WebGL — so the card never shows a blank stage.
   */
  Fallback: ComponentType<{ active: boolean }>;
}

/**
 * Overview scene — a black-and-white Unicorn Studio WebGL animation that fills
 * the card's stage, with a brand-colour overlay that reads through it.
 *
 * The scene is paused on its first frame at rest and only animates while the
 * card is `active` (hover/focus/open), mirroring the GSAP arts it replaces; the
 * brand tint (`.ov-scene__tint`) is owned by CSS and fades in off the card's
 * `.is-active` state. Under reduced motion the scene stays paused on its first
 * frame and only the CSS colour shift remains (SITE.md §8).
 *
 * The matching SVG art doubles as the placeholder, so a slow load or a
 * WebGL-less browser degrades to the original monochrome illustration.
 */
export function OverviewScene({ active, file, Fallback }: OverviewSceneProps) {
  const reduced = useReducedMotion();
  const sceneRef = useRef<SceneInstance>(null);
  const paused = reduced || !active;

  // The `paused` prop only takes effect on later transitions — the wrapper
  // doesn't honour an initial `paused` at mount, so a never-touched card would
  // animate on first paint. Drive `paused` straight on the scene instance once
  // it loads (and on every change) so the resting cards actually hold still.
  useEffect(() => {
    if (sceneRef.current) sceneRef.current.paused = paused;
  }, [paused]);

  return (
    <div className="ov-scene" aria-hidden="true">
      <UnicornScene
        sceneRef={sceneRef}
        onLoad={() => {
          if (sceneRef.current) sceneRef.current.paused = paused;
        }}
        // Vite injects the deploy base ("/" in dev, "/<repo>/" on Pages); the
        // exports live in public/webgl/ so they're served as static assets.
        jsonFilePath={`${import.meta.env.BASE_URL}webgl/${file}.json`}
        className="ov-scene__canvas"
        width="100%"
        height="100%"
        // Decorative card art — trade a little crispness for three lighter GL
        // contexts; 60fps only matters while a card is animating.
        scale={0.9}
        dpi={1}
        fps={60}
        lazyLoad
        production
        // Only run while the card is active; reduced motion holds frame zero.
        paused={paused}
        placeholder={<Fallback active={false} />}
        showPlaceholderWhileLoading
      />
      <div className="ov-scene__tint" />
    </div>
  );
}
