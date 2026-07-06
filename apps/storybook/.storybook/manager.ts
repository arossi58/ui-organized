/**
 * Manager (chrome) customisation — applies the white-label theme so the
 * sidebar, toolbar, and panels match the UI Organized design system instead of
 * stock Storybook. The theme is derived from DS tokens and the visitor's chosen
 * brand + light/dark (shared with the marketing site via localStorage on the
 * same origin). See ./theme.ts.
 */

import { addons } from "storybook/manager-api";
import { makeManagerTheme, readSiteTheme } from "./theme";

// The Figma-style Inspector panel is registered via its preset (see main.ts
// `addons`), which loads its manager entry before addon-a11y so its tab renders
// first.

const { mode, brand } = readSiteTheme();

addons.setConfig({
  theme: makeManagerTheme(mode, brand),
  // Dock the addons panel to the right and open it on the Inspector by default.
  panelPosition: "right",
  showPanel: true,
  selectedPanel: "figma-inspector/panel",
});
