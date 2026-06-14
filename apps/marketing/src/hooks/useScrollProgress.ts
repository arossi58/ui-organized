import { useEffect, useRef, type RefObject } from "react";
import { progressFor } from "../lib/stagePhases";

/**
 * Stage scroll progress P ∈ [0,1] (SITE.md §5), as a ref read by the stage's
 * single rAF loop. Updates are driven by scroll/resize events and coalesced
 * into one rAF — there's no competing continuous loop here, so the engine's
 * loop stays the only one. Downstream code consumes plain P, keeping the phase
 * math library-agnostic (a GSAP ScrollTrigger pin could replace this without
 * touching stagePhases.ts).
 */
export function useScrollProgress(stageRef: RefObject<HTMLElement>) {
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = stageRef.current;
      if (el) progress.current = progressFor(el, window.innerHeight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stageRef]);

  return progress;
}
