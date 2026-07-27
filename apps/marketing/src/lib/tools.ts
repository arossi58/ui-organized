/**
 * The design-system tools surfaced in the /tools gallery.
 *
 * Each tool gets its own route (`/tools/<id>`) and a sidebar entry. The tools
 * themselves are built and embedded later — for now the gallery renders a
 * placeholder panel per tool — so this registry is the single source of truth
 * the sidebar, the router fallback, and (eventually) the embeds all read from.
 */

import type { ComponentType } from "react";
import { Paintbrush, Scaling, HardHat, Braces, ScanEye } from "lucide-react";

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
   * "live" — the tool renders its own panel component (an embedded app, or an
   * explainer for a tool that runs outside the site); "soon" — on the near-term
   * roadmap; "planned" — further out (a "Planned" badge). Non-live tools render
   * a placeholder panel describing what's coming.
   */
  status: "live" | "soon" | "planned";
  /**
   * Sidebar section this tool belongs to, e.g. "Standalone apps". Consecutive
   * tools sharing a group render under one heading; ungrouped tools (the core
   * token/theme tools) sit at the top with no heading.
   */
  group?: string;
  /** Kept in the registry but not surfaced in the sidebar yet. */
  hidden?: boolean;
}

// Order is the sidebar order (and the first entry is the `/tools` default):
// core token/theme tools first, then each named group in turn. Keep tools that
// share a group adjacent — the heading breaks on every group change.
export const TOOLS: ToolDef[] = [
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
    hidden: true,
  },
  {
    id: "color-palette",
    name: "Color Palette Generator",
    tagline: "Build accessible, on-brand color scales.",
    description:
      "Generate full tonal scales from a seed color, check contrast against the design-system semantic roles, and export the result straight to tokens.",
    icon: Paintbrush,
    status: "live",
    group: "Standalone apps",
  },
  {
    id: "icon-scaler",
    name: "Icon Scaler",
    tagline: "Resize and align icons to the grid.",
    description:
      "Normalize icons to a consistent optical size and pixel grid, tune stroke weight across sizes, and export clean, snap-aligned SVGs.",
    icon: Scaling,
    status: "live",
    group: "Standalone apps",
  },
  {
    // Doesn't run here: it's a dev-only npm package you mount in your own app,
    // so its "live" panel is an explainer (UiInspectGuide) rather than an embed.
    id: "ui-inspect",
    name: "UI Inspect",
    tagline: "Live-edit a running app against its own tokens.",
    description:
      "A dev-only inspector you install into your app, built for quick live edits while you work locally. Click any element to see its computed properties resolved against the tokens that page actually ships, change a value against your own scale, and take the result back to code.",
    icon: ScanEye,
    status: "live",
    group: "Dev tools",
  },
];

/** Resolve a tool by slug, falling back to the first tool for `/tools`. */
export function resolveTool(toolId: string | undefined): ToolDef {
  return TOOLS.find((tool) => tool.id === toolId) ?? TOOLS[0];
}
