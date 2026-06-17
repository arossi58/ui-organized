import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Lazy-loaded embeds for the live tools, keyed by their `tools.ts` slug. Each
 * tool is a heavy, self-contained app (its own state, controls, preview), so we
 * code-split it: the bundle loads only when its `/tools/<id>` route is opened.
 *
 * A slug present here + `status: "live"` in tools.ts makes ToolsPage render the
 * tool in the panel; anything missing falls back to the "coming soon"
 * placeholder.
 */
export const TOOL_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  "color-palette": lazy(() => import("../tools/color-palette/ColorPaletteTool")),
  "icon-scaler": lazy(() => import("../tools/icon-scaler/IconScaler")),
  "theme-builder": lazy(() => import("../tools/theme-builder/ThemeBuilder")),
};
