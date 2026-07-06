/**
 * Registers the Figma-style Inspector panel with Storybook (INSPECTOR.md §2).
 * Runs in the manager (chrome) realm; the panel talks to the preview iframe only
 * through Storybook's args channel (§5).
 */
import { addons, types } from "storybook/manager-api";
import { AddonPanel } from "storybook/internal/components";
import { Panel } from "./Panel.js";
// DS token custom properties (`--color-*`, `--border-radius-*`). The shipped
// variables.css isn't in scope in the manager realm (only the preview iframe
// loads it), so we inject it here — that's what lets the panel style itself from
// the design system and flip with light/dark (see figma-tokens.css + Panel).
import tokenVars from "@ui-organized/tokens/variables.css";
import styles from "./figma-tokens.css";

const ADDON_ID = "figma-inspector";
const PANEL_ID = `${ADDON_ID}/panel`;

// This module can be evaluated more than once in a single manager: Storybook
// discovers the addon both through the preset's `managerEntries` and through the
// package's `./manager` export, and the two specifiers resolve to distinct
// module instances. Every side effect below is therefore made idempotent —
// otherwise Storybook logs "figma-inspector was loaded twice" and, worse, the
// second `addons.register` re-adds the panel, pushing its tab to the end of the
// panel bar instead of leaving it first.

function injectStyle(id: string, css: string): void {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

// Tokens first so the panel styles can layer on top / override where needed.
injectStyle("fcp-token-vars", tokenVars);
injectStyle("fcp-styles", styles);

const flags = globalThis as typeof globalThis & { __fcpInspectorRegistered?: boolean };
if (!flags.__fcpInspectorRegistered) {
  flags.__fcpInspectorRegistered = true;
  addons.register(ADDON_ID, () => {
    addons.add(PANEL_ID, {
      type: types.PANEL,
      title: "Inspector",
      match: ({ viewMode }) => viewMode === "story",
      render: ({ active }) => (
        <AddonPanel active={!!active}>
          <Panel />
        </AddonPanel>
      ),
    });
  });
}
