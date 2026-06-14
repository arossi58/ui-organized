import { createContext, useContext } from "react";

/**
 * The themed preview element. Theme variables in the builder are applied as
 * inline custom properties on the preview content div (not on `<html>`), so any
 * portaled overlay — e.g. the Select dropdown — must mount inside this element
 * to inherit them. Defaults to `null` (portal to `document.body`) outside the
 * preview.
 */
export const PreviewPortalContext = createContext<HTMLElement | null>(null);

/** The themed element overlays should portal into, or `null` if unavailable. */
export function usePreviewPortalContainer(): HTMLElement | null {
  return useContext(PreviewPortalContext);
}
