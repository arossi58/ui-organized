/**
 * The design-system tools surfaced in the /tools gallery.
 *
 * Each tool gets its own route (`/tools/<id>`) and a sidebar entry. The tools
 * themselves are built and embedded later — for now the gallery renders a
 * placeholder panel per tool — so this registry is the single source of truth
 * the sidebar, the router fallback, and (eventually) the embeds all read from.
 */

import type { CanonicalIconName } from "@ui-organized/utils";

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
   * Design-system icon (sidebar item + panel art). The canonical set is generic
   * — there's no palette/sliders glyph yet — so these are the closest fits;
   * swap to dedicated icons when the set grows.
   */
  icon: CanonicalIconName;
  /**
   * "soon" — on the near-term roadmap; "planned" — further out (a "Planned"
   * badge in the sidebar). None are embedded yet, so every panel reads as
   * coming soon until its tool lands.
   */
  status: "soon" | "planned";
}

export const TOOLS: ToolDef[] = [
  {
    id: "color-palette",
    name: "Color Palette Generator",
    tagline: "Build accessible, on-brand color scales.",
    description:
      "Generate full tonal scales from a seed color, check contrast against the design-system semantic roles, and export the result straight to tokens.",
    icon: "grid",
    status: "soon",
  },
  {
    id: "icon-scaler",
    name: "Icon Scaler",
    tagline: "Resize and align icons to the grid.",
    description:
      "Normalize icons to a consistent optical size and pixel grid, tune stroke weight across sizes, and export clean, snap-aligned SVGs.",
    icon: "search",
    status: "soon",
  },
  {
    id: "theme-builder",
    name: "Theme Builder",
    tagline: "Compose brand themes from the token set.",
    description:
      "Pick a brand accent, preview light and dark in real time, and produce a theme that re-skins every component through the design-system tokens.",
    icon: "settings",
    status: "soon",
  },
  {
    id: "token-manager",
    name: "Token Manager",
    tagline: "Browse, edit, and sync design tokens.",
    description:
      "A central home for the token set — inspect every semantic value, edit in place, and keep code and Figma in sync from one source of truth.",
    icon: "tag",
    status: "planned",
  },
];

/** Resolve a tool by slug, falling back to the first tool for `/tools`. */
export function resolveTool(toolId: string | undefined): ToolDef {
  return TOOLS.find((tool) => tool.id === toolId) ?? TOOLS[0];
}
