/**
 * The design-system tools surfaced in the /tools gallery.
 *
 * Each tool gets its own route (`/tools/<id>`) and a sidebar entry. The tools
 * themselves are built and embedded later — for now the gallery renders a
 * placeholder panel per tool — so this registry is the single source of truth
 * the sidebar, the router fallback, and (eventually) the embeds all read from.
 */

import type { ComponentType } from "react";
import { Paintbrush, Scaling, HardHat, Braces } from "lucide-react";

export interface ToolDef {
  /** URL slug — the `:toolId` route param. */
  id: string;
  /** Sidebar label + panel heading. */
  name: string;
  /** One-line summary shown under the heading. */
  tagline: string;
  /** Longer blurb for the placeholder panel. */
  description: string;
  /**
   * Sidebar + panel-art icon. An icon component imported straight from the
   * library (e.g. lucide-react) — passed through to the DS `Icon`, which renders
   * it as-is. No canonical-name registration needed, and only the icons we
   * import here ship in the bundle.
   */
  icon: ComponentType<Record<string, unknown>>;
  /**
   * "live" — the tool is embedded and interactive in the panel; "soon" — on the
   * near-term roadmap; "planned" — further out (a "Planned" badge). Non-live
   * tools render a placeholder panel describing what's coming.
   */
  status: "live" | "soon" | "planned";
}

export const TOOLS: ToolDef[] = [
  {
    id: "color-palette",
    name: "Color Palette Generator",
    tagline: "Build accessible, on-brand color scales.",
    description:
      "Generate full tonal scales from a seed color, check contrast against the design-system semantic roles, and export the result straight to tokens.",
    icon: Paintbrush,
    status: "live",
  },
  {
    id: "icon-scaler",
    name: "Icon Scaler",
    tagline: "Resize and align icons to the grid.",
    description:
      "Normalize icons to a consistent optical size and pixel grid, tune stroke weight across sizes, and export clean, snap-aligned SVGs.",
    icon: Scaling,
    status: "live",
  },
  {
    id: "theme-builder",
    name: "Theme Builder",
    tagline: "Compose brand themes from the token set.",
    description:
      "Pick a brand accent, preview light and dark in real time, and produce a theme that re-skins every component through the design-system tokens.",
    icon: HardHat,
    status: "live",
  },
  {
    id: "token-manager",
    name: "Token Manager",
    tagline: "Browse, edit, and sync design tokens.",
    description:
      "A central home for the token set — inspect every semantic value, edit in place, and keep code and Figma in sync from one source of truth.",
    icon: Braces,
    status: "planned",
  },
];

/** Resolve a tool by slug, falling back to the first tool for `/tools`. */
export function resolveTool(toolId: string | undefined): ToolDef {
  return TOOLS.find((tool) => tool.id === toolId) ?? TOOLS[0];
}
