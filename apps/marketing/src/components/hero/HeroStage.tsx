import { useEffect, useRef, useState } from "react";
import { HeroTitle } from "./HeroTitle";
import { AppFrame } from "./AppFrame";
import { PieceLayer } from "./PieceLayer";
import { EndCaption } from "./EndCaption";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import type { HeroStageEngine } from "../../lib/heroStageEngine";
import "../gradient/dot-grid.css";
import "./hero-stage.css";

/**
 * The hero scroll stage (SITE.md §5): a 300vh track with a pinned viewport in
 * which the pieces fall (matter-js), assemble into the app frame as you scroll,
 * and settle under the tucked title. All motion is owned by one engine loop;
 * the gradient layers, title, frame, pieces, and caption are thin views the
 * engine drives via refs. Under reduced motion the engine renders the finished
 * layout statically — no physics, no scroll track.
 */
export function HeroStage() {
  const reduced = useReducedMotion();
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const pieceEls = useRef<Array<HTMLElement | null>>([]);

  const progress = useScrollProgress(stageRef);

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const layer = layerRef.current;
    const frame = frameRef.current;
    const title = titleRef.current;
    const caption = captionRef.current;
    if (!stage || !sticky || !layer || !frame || !title || !caption) {
      return;
    }

    // Lazy-load the engine (and matter-js) as a separate chunk so first paint
    // is just the gradient + heading + frame — physics streams in after
    // (SITE.md §2, §8). The piece DOM is already hidden until spawn.
    let engine: HeroStageEngine | null = null;
    let cancelled = false;
    void import("../../lib/heroStageEngine").then(({ createHeroStageEngine }) => {
      if (cancelled) return;
      engine = createHeroStageEngine(
        {
          stage,
          sticky,
          layer,
          frame,
          title,
          caption,
          glow: null,
          pieceEls: pieceEls.current,
        },
        { reducedMotion: reduced, finePointer },
      );
      engine.setProgressSource(() => progress.current);
      engine.start();
    });
    return () => {
      cancelled = true;
      engine?.stop();
    };
  }, [reduced, finePointer, progress]);

  return (
    <div className={`hero-stage${reduced ? " hero-stage--static" : ""}`} ref={stageRef}>
      <div className="hero-stage__sticky" ref={stickyRef}>
        {/* No gradient layers — flat surface with the dot lattice only. */}
        <div className="hero-stage__dots dot-grid" aria-hidden="true" />

        <HeroTitle rootRef={titleRef} />
        <AppFrame ref={frameRef} />
        <PieceLayer ref={layerRef} pieceEls={pieceEls} />
        <EndCaption rootRef={captionRef} />
      </div>
      {/* Soft scroll-snap point at the edit-mode threshold (see hero-stage.css). */}
      <div className="hero-stage__snap" aria-hidden="true" />
    </div>
  );
}
