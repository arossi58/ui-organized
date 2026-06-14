import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Wires a paused, looping GSAP timeline to a hover/focus `active` flag.
 *
 * The timeline is built once (scoped to the returned ref via `gsap.context`, so
 * every selector inside `build` resolves within that element and teardown is a
 * single `ctx.revert()`). While `active` it eases up to full speed; when it
 * goes inactive the motion decelerates to a soft stop instead of snapping —
 * the colour fade back to monochrome is owned by CSS.
 *
 * SITE.md §8: reduced motion is a first-class path — the timeline is never
 * built, so the art renders in its static resting pose and only the CSS colour
 * shift on hover remains.
 */
export function useHoverTimeline<T extends SVGSVGElement | HTMLElement>(
  active: boolean,
  build: (scope: T) => gsap.core.Timeline,
) {
  const scope = useRef<T>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const reduced = useReducedMotion();

  // Keep the latest builder without rebuilding the timeline every render.
  const buildRef = useRef(build);
  buildRef.current = build;

  useLayoutEffect(() => {
    const el = scope.current;
    if (reduced || !el) return;

    const ctx = gsap.context(() => {
      const timeline = buildRef.current(el);
      timeline.timeScale(0).pause();
      tl.current = timeline;
    }, el);

    return () => {
      ctx.revert();
      tl.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const timeline = tl.current;
    if (!timeline) return;

    if (active) {
      timeline.play();
      gsap.to(timeline, {
        timeScale: 1,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    } else {
      gsap.to(timeline, {
        timeScale: 0,
        duration: 0.7,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => timeline.pause(),
      });
    }
  }, [active]);

  return scope;
}
