import { useEffect, useRef, useState } from "react";
import { HeroTitle } from "./HeroTitle";
import { AppFrame } from "./AppFrame";
import { PieceLayer } from "./PieceLayer";
import { EndCaption } from "./EndCaption";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import type { HeroStageEngine } from "../../lib/heroStageEngine";
import { DESKTOP_MANIFEST } from "../../lib/pieceManifest";
import { MOBILE_MANIFEST } from "../../lib/mobilePieceManifest";
import "../gradient/dot-grid.css";
import "./hero-stage.css";

/** localStorage key holding the local date (YYYY-MM-DD) the falling intro last
 * played, so it only plays once per calendar day per visitor (feedback). */
const HERO_INTRO_KEY = "uio:hero-intro-day";

/** Today as a local YYYY-MM-DD stamp (not UTC, so "per day" matches the visitor's
 * clock). */
function todayStamp(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whether the falling intro already played today (→ open on the assembled,
 * interactive layout instead). Reads once at mount; falls back to playing the
 * intro if storage is unavailable (private mode, etc.). */
function introSeenToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HERO_INTRO_KEY) === todayStamp();
  } catch {
    return false;
  }
}

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
  // Phones get a bespoke mobile screen the pieces assemble into (feedback);
  // wider viewports get the desktop dashboard. The manifests are module
  // constants, so `manifest` is a stable identity per breakpoint.
  const isMobile = useMediaQuery("(max-width: 720px)");
  const manifest = isMobile ? MOBILE_MANIFEST : DESKTOP_MANIFEST;
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );
  // Play the staggered fall-in only on the first visit of the day; on repeat
  // same-day visits the pieces start already settled in the matter.js pile, so
  // they don't "pop in" — but the full scroll track and the physics → assembled
  // component transition are unchanged (feedback). Captured once at mount.
  const [skipIntro] = useState(introSeenToday);

  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const pieceEls = useRef<Array<HTMLElement | null>>([]);

  const progress = useScrollProgress(stageRef);

  // Mark the intro as played today the first time we run it (so the next visit
  // this day skips it). Only when we're actually animating — reduced motion and
  // repeat visits don't claim the slot.
  useEffect(() => {
    if (reduced || skipIntro) return;
    try {
      window.localStorage.setItem(HERO_INTRO_KEY, todayStamp());
    } catch {
      /* storage unavailable — the intro just replays next visit, which is fine. */
    }
  }, [reduced, skipIntro]);

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
          fade: fadeRef.current,
          pieceEls: pieceEls.current,
        },
        { reducedMotion: reduced, finePointer, skipIntro, manifest },
      );
      engine.setProgressSource(() => progress.current);
      engine.start();
    });
    return () => {
      cancelled = true;
      engine?.stop();
    };
    // `manifest` flips when crossing the mobile breakpoint — rebuild the engine
    // (and its bodies) for the new frame + piece set.
  }, [reduced, finePointer, progress, skipIntro, manifest]);

  const mobileFrame = manifest.variant === "mobile";

  return (
    <div
      className={`hero-stage${reduced ? " hero-stage--static" : ""}${mobileFrame ? " hero-stage--mobile" : ""}`}
      ref={stageRef}
    >
      <div className="hero-stage__sticky" ref={stickyRef}>
        {/* No gradient layers — flat surface with the dot lattice only. */}
        <div className="hero-stage__dots dot-grid" aria-hidden="true" />

        <HeroTitle rootRef={titleRef} />
        <AppFrame
          ref={frameRef}
          variant={manifest.variant}
          frameW={manifest.frameW}
          frameH={manifest.frameH}
        />
        {/* Keyed by variant so switching breakpoints fully remounts the pieces
            (the two manifests share no ids) and re-collects their refs. */}
        <PieceLayer
          key={manifest.variant}
          ref={layerRef}
          pieces={manifest.pieces}
          pieceEls={pieceEls}
        />
        {/* Mobile: the phone bleeds off the bottom; this gradient fades it into
            the page so the caption below reads cleanly over it (Figma 299:14654). */}
        {mobileFrame && (
          <div className="hero-stage__fade" aria-hidden="true" ref={fadeRef} />
        )}
        <EndCaption rootRef={captionRef} />
      </div>
      {/* Soft scroll-snap point at the edit-mode threshold (see hero-stage.css). */}
      <div className="hero-stage__snap" aria-hidden="true" />
    </div>
  );
}
