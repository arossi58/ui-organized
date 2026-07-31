/**
 * Containment for portalled overlays.
 *
 * Every overlay in this library portals to `document.body` and positions itself
 * against the viewport, which is right in an application and wrong in a preview:
 * a documentation surface that renders a Dialog gets a backdrop over the whole
 * page, a focus trap, a scroll lock, and popup content that lives outside
 * whatever box was meant to be showing it.
 *
 * Wrapping a subtree in `<PreviewOverlayProvider contain>` flips that. Overlay
 * content renders **in place** rather than portalling (Ark's `Portal` takes a
 * `disabled` prop for exactly this), so the popup is a descendant of the box
 * that owns it — which means an inspector scanning that box finds it, an axe run
 * scoped to that box audits it, and a CSS filter over that box tints it. The
 * roots also drop their modal behaviour, since trapping focus and locking page
 * scroll for a preview would take over the page the containment was meant to
 * protect.
 *
 * The one thing this can't do from inside the library is establish the CSS
 * containing block. `position: fixed` still resolves against the viewport unless
 * an ancestor of the overlay creates a containing block — `contain: paint`,
 * `transform`, or `filter` on the container element. That's the consumer's job,
 * and it's what clips the backdrop to the preview frame.
 */
import * as React from "react";

export interface PreviewOverlay {
  /**
   * Render overlay content in place instead of portalling it to `document.body`,
   * and drop the modal behaviours (focus trap, scroll lock, dismiss-on-outside)
   * that only make sense when an overlay owns the window.
   */
  contain: boolean;
  /**
   * Portal target for overlays that still portal. Ignored when `contain` is set.
   * Note Ark reads `container` into state keyed on the ref OBJECT's identity, so
   * a ref that is still null on first render never re-portals — pass a ref whose
   * `.current` is populated before the overlay mounts.
   */
  container?: React.RefObject<HTMLElement | null>;
}

const DEFAULT: PreviewOverlay = { contain: false };

/**
 * Keyed on `globalThis` for the same reason the icon registry is (see
 * `icons/registry.ts`): this module is reachable from two bundle entries, and
 * the CJS build cannot code-split. Two copies of the module would mean two
 * distinct context objects — the provider writing to one while every overlay
 * reads the other, and containment silently never engaging.
 */
const CONTEXT_KEY = Symbol.for("@ui-organized/react.previewOverlayContext");

type GlobalWithContext = typeof globalThis & {
  [CONTEXT_KEY]?: React.Context<PreviewOverlay>;
};

const globalRef = globalThis as GlobalWithContext;
const PreviewOverlayContext: React.Context<PreviewOverlay> = (globalRef[CONTEXT_KEY] ??=
  React.createContext<PreviewOverlay>(DEFAULT));

export interface PreviewOverlayProviderProps extends Partial<PreviewOverlay> {
  children?: React.ReactNode;
}

/** Contain every overlay rendered inside this subtree. */
export function PreviewOverlayProvider({
  contain = false,
  container,
  children,
}: PreviewOverlayProviderProps) {
  const value = React.useMemo<PreviewOverlay>(() => ({ contain, container }), [contain, container]);
  return <PreviewOverlayContext.Provider value={value}>{children}</PreviewOverlayContext.Provider>;
}

/** The containment settings in force. `{ contain: false }` outside a provider. */
export function usePreviewOverlay(): PreviewOverlay {
  return React.useContext(PreviewOverlayContext);
}
