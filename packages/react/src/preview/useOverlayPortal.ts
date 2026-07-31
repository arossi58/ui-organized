/**
 * The three things an overlay component asks the preview context, kept here so
 * each component's diff is one line per question rather than a repeated
 * `useContext` + branch.
 *
 * An explicitly-passed prop always beats the context: a caller who names a
 * `container` or a `modal` means it, and containment is an ambient default, not
 * an override.
 */
import { usePreviewOverlay } from "./previewOverlay.js";
import type { RefObject } from "react";

export interface OverlayPortalProps {
  /** Render children in place, no portal. */
  disabled?: boolean;
  container?: RefObject<HTMLElement | null>;
}

/** Props for the Ark `<Portal>` wrapping an overlay's content. */
export function useOverlayPortal(container?: RefObject<HTMLElement | null>): OverlayPortalProps {
  const { contain, container: fromContext } = usePreviewOverlay();
  if (container) return { container };
  if (contain) return { disabled: true };
  return { container: fromContext };
}

/**
 * Dialog-family roots (Dialog, Sheet, AlertDialog). Contained overlays sit
 * inside a page that stays interactive, so every behaviour that assumes the
 * overlay owns the window is switched off — including dismiss-on-outside, since
 * "outside" is now most of the page the reader is using.
 */
export interface ContainedDialogProps {
  modal?: false;
  trapFocus?: false;
  preventScroll?: false;
  closeOnInteractOutside?: false;
}

const CONTAINED_DIALOG: ContainedDialogProps = {
  modal: false,
  trapFocus: false,
  preventScroll: false,
  closeOnInteractOutside: false,
};

const NONE = {};

export function useContainedDialogProps(): ContainedDialogProps {
  return usePreviewOverlay().contain ? CONTAINED_DIALOG : NONE;
}

/** Popover root. zag's popover machine has no `trapFocus`/`preventScroll`. */
export interface ContainedPopoverProps {
  modal?: false;
  closeOnInteractOutside?: false;
}

const CONTAINED_POPOVER: ContainedPopoverProps = { modal: false, closeOnInteractOutside: false };

export function useContainedPopoverProps(): ContainedPopoverProps {
  return usePreviewOverlay().contain ? CONTAINED_POPOVER : NONE;
}

/**
 * Positioning overrides for a popper-positioned overlay inside a preview box.
 *
 * Two changes, both about the box being small:
 *
 * - `strategy: "absolute"` — `fixed` is right against the viewport and wrong
 *   inside a containing block, where the coordinates it computes are offset by
 *   the container's own position.
 * - `flip: false` — collision detection runs against the *frame* now, so a popup
 *   taller than the space below its trigger flips above it, lands outside the
 *   frame and is clipped away entirely. Opening downward always means the top of
 *   the popup — the part anchored to the trigger — is the part you can see.
 *   `slide` still nudges it sideways to stay in view.
 */
export interface ContainedPositioning {
  strategy: "absolute";
  flip: false;
  slide: true;
  overflowPadding: number;
}

const CONTAINED_POSITIONING: ContainedPositioning = {
  strategy: "absolute",
  flip: false,
  slide: true,
  overflowPadding: 8,
};

export function useContainedPositioning(): ContainedPositioning | undefined {
  return usePreviewOverlay().contain ? CONTAINED_POSITIONING : undefined;
}
