/**
 * Sandbox thread (Connect.md §4.1). Owns the `figma` API: reads the selection,
 * reads/writes the pluginData POINTER on a node (never prop data — that lives in
 * the manifest, §4.1), and persists settings in `figma.clientStorage`. All network
 * and manifest logic lives in the UI iframe (`ui.tsx`), which has `fetch`.
 */

import { PLUGIN_DATA_KEYS } from "@ui-organized/code-connect/browser";
import {
  EMPTY_SETTINGS,
  type GhSettings,
  type SandboxToUI,
  type SelectionInfo,
  type UIToSandbox,
} from "./messages.js";

const SETTINGS_KEY = "figmaCodeConnect:settings";

figma.showUI(__html__, { width: 380, height: 560, title: "Code Connect" });

function post(msg: SandboxToUI): void {
  figma.ui.postMessage(msg);
}

/** Best-effort variant property names, used to rank suggestions (§4.3). */
function variantPropsOf(node: SceneNode): string[] {
  try {
    if (node.type === "COMPONENT_SET") {
      return Object.keys(node.componentPropertyDefinitions ?? {});
    }
    if (node.type === "INSTANCE") {
      return Object.keys(node.componentProperties ?? {});
    }
    if (node.type === "COMPONENT" && node.parent?.type === "COMPONENT_SET") {
      return Object.keys(node.parent.componentPropertyDefinitions ?? {});
    }
  } catch {
    // componentPropertyDefinitions can throw on unloaded pages — ignore.
  }
  return [];
}

/** The node we attach the mapping to (prefer a main component over an instance). */
function mappingTarget(node: SceneNode): BaseNode {
  return node;
}

/** The node's intrinsic component key — published key, or node id as a fallback. */
function figmaKeyOf(node: SceneNode): string {
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") return node.key || node.id;
  return node.id;
}

function readSelection(): SelectionInfo {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    return { nodeId: "", nodeName: "", kind: "none", figmaKey: "", mappedKey: null, variantProps: [] };
  }
  if (sel.length > 1) {
    return { nodeId: "", nodeName: "", kind: "multiple", figmaKey: "", mappedKey: null, variantProps: [] };
  }
  const node = sel[0]!;
  const kind =
    node.type === "COMPONENT" || node.type === "COMPONENT_SET"
      ? "component"
      : node.type === "INSTANCE"
        ? "instance"
        : "other";
  const key = mappingTarget(node).getPluginData(PLUGIN_DATA_KEYS.componentKey);
  return {
    nodeId: node.id,
    nodeName: node.name,
    kind,
    figmaKey: figmaKeyOf(node),
    mappedKey: key || null,
    variantProps: variantPropsOf(node),
  };
}

function sendSelection(): void {
  post({ type: "selection", selection: readSelection() });
}

async function loadSettings(): Promise<GhSettings> {
  const stored = (await figma.clientStorage.getAsync(SETTINGS_KEY)) as Partial<GhSettings> | undefined;
  return { ...EMPTY_SETTINGS, ...(stored ?? {}) };
}

figma.on("selectionchange", sendSelection);

figma.ui.onmessage = async (msg: UIToSandbox) => {
  switch (msg.type) {
    case "ready": {
      post({ type: "settings", settings: await loadSettings() });
      sendSelection();
      break;
    }
    case "save-settings": {
      await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
      figma.notify("Code Connect settings saved");
      break;
    }
    case "write-mapping": {
      const sel = figma.currentPage.selection;
      if (sel.length !== 1) {
        figma.notify("Select a single component to map", { error: true });
        break;
      }
      const target = mappingTarget(sel[0]!);
      target.setPluginData(PLUGIN_DATA_KEYS.componentKey, msg.componentKey);
      target.setPluginData(PLUGIN_DATA_KEYS.mappedAt, new Date().toISOString());
      sendSelection();
      break;
    }
    case "clear-mapping": {
      const sel = figma.currentPage.selection;
      if (sel.length === 1) {
        const target = mappingTarget(sel[0]!);
        target.setPluginData(PLUGIN_DATA_KEYS.componentKey, "");
        target.setPluginData(PLUGIN_DATA_KEYS.mappedAt, "");
        sendSelection();
      }
      break;
    }
    case "notify": {
      figma.notify(msg.message);
      break;
    }
    case "resize": {
      figma.ui.resize(380, Math.max(360, Math.min(900, Math.round(msg.height))));
      break;
    }
  }
};
