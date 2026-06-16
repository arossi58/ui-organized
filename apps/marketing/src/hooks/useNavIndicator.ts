import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Drives the sliding "selected pill" in SiteNav. A single brand pill rests over
 * the active tab and, on navigation, slides + resizes smoothly to the newly
 * selected one (the nav persists across routes, so the motion is continuous).
 * Tab labels crossfade from ink to on-brand contrast via the `--_label-mix`
 * custom prop, which stays theme-aware.
 *
 * SITE.md §8: reduced motion is a first-class path — the pill snaps to the
 * active tab with no slide. Positions are re-measured on resize and on font load
 * (web fonts change tab widths after first paint).
 */
export function useNavIndicator(activeIndex: number) {
  const reduced = useReducedMotion();

  const containerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const prevIndex = useRef(activeIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const ready = useRef(false);

  const setLinkRef = (i: number) => (el: HTMLAnchorElement | null) => {
    linkRefs.current[i] = el;
  };

  // Geometry of tab `i` relative to the links container (= the pill's offset
  // parent). The pill matches the tab's box exactly, so it reads as the tab's
  // own background — selecting never changes a tab's size (zero layout shift).
  function rectFor(i: number) {
    const container = containerRef.current;
    const link = linkRefs.current[i];
    if (!container || !link) return null;
    const c = container.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    return {
      left: l.left - c.left,
      top: l.top - c.top,
      width: l.width,
      height: l.height,
    };
  }

  // Recolour labels: the active one to on-brand contrast, the rest to ink.
  function paintLabels(index: number, animate: boolean) {
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      const mix = i === index ? 1 : 0;
      if (animate) {
        gsap.to(el, {
          "--_label-mix": mix,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
        });
      } else {
        gsap.set(el, { "--_label-mix": mix });
      }
    });
  }

  // Move the pill to tab `index`, sliding when `animate`, snapping otherwise.
  function place(index: number, animate: boolean) {
    const pill = pillRef.current;
    if (!pill) return;
    tweenRef.current?.kill();

    const r = rectFor(index);
    if (!r) {
      gsap.set(pill, { opacity: 0 }); // no active route ⇒ no pill
      paintLabels(index, animate);
      return;
    }

    if (animate) {
      tweenRef.current = gsap.to(pill, {
        ...r,
        opacity: 1,
        duration: 0.42,
        ease: "power3.inOut",
        overwrite: true,
      });
    } else {
      gsap.set(pill, { ...r, opacity: 1 });
    }
    paintLabels(index, animate);
  }

  // Build/teardown: snap to the active tab, then re-measure on resize + font
  // load. Rebuilds if the reduced-motion preference flips.
  useLayoutEffect(() => {
    place(activeIndex, false);
    prevIndex.current = activeIndex;
    ready.current = true;

    const container = containerRef.current;
    const ro = new ResizeObserver(() => place(prevIndex.current, false));
    if (container) ro.observe(container);

    let cancelled = false;
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) place(prevIndex.current, false);
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      tweenRef.current?.kill();
      ready.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Slide whenever the active tab changes.
  useEffect(() => {
    if (!ready.current) return;
    if (prevIndex.current === activeIndex) return;
    place(activeIndex, !reduced);
    prevIndex.current = activeIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return { containerRef, pillRef, setLinkRef };
}
