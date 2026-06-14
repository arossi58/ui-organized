import { useEffect, useRef } from "react";

/**
 * Adds `is-visible` to the element once it scrolls into view, pairing with the
 * `.reveal` class in layout.css. One IntersectionObserver per element, torn
 * down after it fires — no scroll listeners, no per-frame work.
 *
 * Returns a ref to attach to the element you want to reveal.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // options is a fresh object literal each render by default; callers that
    // need custom options should memoize them. Intentionally run-once otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
