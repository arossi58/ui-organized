import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";

interface OverviewVideoSceneProps {
  /** Whether the owning card is currently selected (its detail panel is open). */
  selected: boolean;
  /** Asset basename under `public/card-animations/` (e.g. "design"). */
  file: string;
}

/**
 * Overview scene — a short WebM that *assembles* the card's UI mockup: it opens
 * on a blank frame and builds up to the finished mockup, holding on that last
 * frame (the clip has no `loop`).
 *
 * Behaviour (per the design brief): the animation plays **once** each time the
 * card becomes selected and then holds — it does not loop or replay until the
 * card is selected again. The play is deferred until the card is actually in
 * view, so the card that starts open (Design) plays when the overview first
 * scrolls into view rather than silently off-screen on load; user (re)selections
 * happen in view and play immediately. At rest a matching last-frame `poster`
 * covers the gap before the first play, and the non-looping video naturally
 * freezes on the same frame afterwards. Under reduced motion the clip never
 * plays and the poster/last frame stays.
 */
export function OverviewVideoScene({ selected, file }: OverviewVideoSceneProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasSelected = useRef(selected);
  const inView = useRef(false);
  // A queued play, consumed once the card is in view. Seeded from the initial
  // selection so a card that starts open plays on first scroll-into-view.
  const pendingPlay = useRef(selected);
  const base = `${import.meta.env.BASE_URL}card-animations/${file}`;

  // Play from the top, but only once the card is both selected (a play is
  // queued) and on-screen. Muted playback is allowed to autoplay; ignore the
  // rejection that fires if the element is torn down mid-load.
  const playIfReady = useCallback(() => {
    const video = videoRef.current;
    if (!video || reduced || !inView.current || !pendingPlay.current) return;
    pendingPlay.current = false;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [reduced]);

  // Track viewport entry; entering view flushes any queued play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) playIfReady();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [playIfReady]);

  // Rising edge of selection (unselected → selected) → queue a play, flushed
  // immediately when the card is already in view (the usual case for a click).
  useEffect(() => {
    if (selected && !wasSelected.current) {
      pendingPlay.current = true;
      playIfReady();
    }
    wasSelected.current = selected;
  }, [selected, playIfReady]);

  return (
    <video
      ref={videoRef}
      className="ov-video-scene"
      src={`${base}.webm`}
      poster={`${base}.poster.png`}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
