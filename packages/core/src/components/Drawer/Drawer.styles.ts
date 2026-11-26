/**
 * A panel that slides up from the bottom of the viewport and is dismissed by
 * swiping it back down, by Escape, by the backdrop or by its close button.
 *
 * The title, description, footer and close button are the Dialog's chrome,
 * as a Sheet's are. What is the Drawer's own is the bottom edge, the grabber
 * and the swipe: the panel follows the pointer down and, on release, either
 * closes or springs back (see drawerSwipe.ts).
 */
export const DRAWER_CLASS = {
  backdrop: "drawer__backdrop",
  positioner: "drawer__positioner",
  popup: "drawer__popup",
  grabber: "drawer__grabber",
  grabberIndicator: "drawer__grabber-indicator",
  close: "dialog__close",
  title: "dialog__title text-strong-heading-small",
  description: "dialog__description text-default-body-medium",
  footer: "dialog__footer drawer__footer",
} as const;

/** The close button's icon size. */
export const DRAWER_CLOSE_ICON_SIZE = 20;
