import { useEffect, useLayoutEffect, useState } from "react";

/** A layout effect in the browser, and nothing to warn about on the server. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Whether `query` matches, or `undefined` until it has been asked.
 *
 * @internal AppShell's own. It starts at `undefined` on the server and on the
 * first client render, so a hydrating page renders exactly the markup the
 * server sent (the site's `useMediaQuery` reads `matchMedia` while
 * initialising state, which would not). The answer arrives in a layout
 * effect, before the first paint of a page rendered on the client.
 */
export function useMediaQuery(query: string, enabled: boolean): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(undefined);
  useIsomorphicLayoutEffect(() => {
    if (!enabled || typeof window.matchMedia !== "function") return;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query, enabled]);
  return enabled ? matches : undefined;
}
