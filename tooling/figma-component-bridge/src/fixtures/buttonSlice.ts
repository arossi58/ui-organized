/**
 * Phase 0 hand-authored spec — the vertical slice (COMPONENT-PLUGIN.md §3, Phase 0).
 *
 * One component (`Button`), one variant axis (`intent`: primary | secondary),
 * real tokens (fill / radius / label color), at a single size + state. No
 * analyzer, no renderer — this is written by hand so the Figma Builder contract
 * can be proven before any of the companion service exists.
 *
 * Token refs mirror the real component CSS (packages/react/src/components/Button/
 * Button.css): `--color-interactive-primary-default`, `--radius-interactive`, etc.
 * `fallbacks` are only painted if a Variable can't be resolved by name — they
 * keep the build visible while the miss is reported to the resolution queue.
 */

import type { ComponentSpec } from "../spec";

export const buttonSlice: ComponentSpec = {
  component: "Button",
  source: { file: "packages/react/src/components/Button/Button.tsx", hash: "sha256:handwritten-phase0" },
  propertyDefinitions: {
    intent: { type: "VARIANT", values: ["primary", "secondary"], default: "primary" },
    // Documented in the contract, but not wired as Figma component properties in
    // Phase 0 — non-variant props are Phase 4.
    size: { type: "VARIANT", values: ["md"], default: "md" },
    children: { type: "TEXT", default: "Button" },
  },
  states: ["default"],
  variants: [
    {
      props: { intent: "primary", size: "md", state: "default" },
      tree: {
        name: "root",
        layout: { mode: "HORIZONTAL", padding: [8, 16, 8, 16], gap: 4, align: "CENTER", justify: "CENTER" },
        box: { radius: "{--radius-interactive}", fill: "{--color-interactive-primary-default}" },
        children: [
          {
            name: "label",
            type: "TEXT",
            text: "Button",
            typography: { size: 14, color: "{--color-interactive-contents}" },
          },
        ],
      },
    },
    {
      props: { intent: "secondary", size: "md", state: "default" },
      tree: {
        name: "root",
        layout: { mode: "HORIZONTAL", padding: [8, 16, 8, 16], gap: 4, align: "CENTER", justify: "CENTER" },
        box: { radius: "{--radius-interactive}", fill: "{--color-interactive-secondary-default}" },
        children: [
          {
            name: "label",
            type: "TEXT",
            text: "Button",
            typography: { size: 14, color: "{--color-text-primary}" },
          },
        ],
      },
    },
  ],
  unresolved: [],
  fallbacks: {
    "--color-interactive-primary-default": "#2563eb",
    "--color-interactive-secondary-default": "#e3e3e3",
    "--color-interactive-contents": "#ffffff",
    "--color-text-primary": "#1a1a1a",
    "--radius-interactive": "8",
  },
};
