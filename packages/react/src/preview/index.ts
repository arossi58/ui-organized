/**
 * `@ui-organized/react/preview` — tools for surfaces that *show* components
 * rather than use them: documentation stages, theme previews, inspectors.
 *
 * Deliberately a subpath rather than part of the main barrel. Nothing in an
 * application should reach for this, and keeping it out of `.` keeps the
 * library's public API the components themselves.
 */
export { PreviewOverlayProvider, usePreviewOverlay } from "./previewOverlay.js";
export type { PreviewOverlay, PreviewOverlayProviderProps } from "./previewOverlay.js";
