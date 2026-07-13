import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query, reactively. Reads the initial value synchronously so
 * the first render already matches the viewport (no flash), then updates on
 * change. SSR-safe: returns `false` where `window`/`matchMedia` is unavailable.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
