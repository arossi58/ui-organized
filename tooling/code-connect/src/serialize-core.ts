/**
 * Pure, browser-safe payload construction for `get_component_context`
 * (Connect.md §6.2, §6.4). No Node imports — so the Figma plugin's "Preview
 * Payload" (§4.2, §7) and the MCP server both build the EXACT same shape from this
 * one place, with no daylight between what a human previews and what the agent
 * gets (§0.5 success criterion 5).
 *
 * The Node-only concerns (loading the manifest, computing staleness from the
 * filesystem) live in `mcp/serialize.ts`, which composes these builders.
 */

import type {
  ComponentManifestEntry,
  GetComponentContextOutput,
  Staleness,
} from "./schema.js";
import { PLUGIN_DATA_KEYS } from "./constants.js";

/** Neither a key nor a node id was supplied. */
export function missingInput(): GetComponentContextOutput {
  return {
    found: false,
    confidence: "none",
    warning: "Provide either figmaComponentKey or figmaNodeId.",
  };
}

/** A bare node id can't be resolved from the manifest — direct the caller (§4.1). */
export function unresolvableNode(figmaNodeId: string): GetComponentContextOutput {
  return {
    found: false,
    confidence: "none",
    warning:
      `No component key supplied for node "${figmaNodeId}". Read the node's ` +
      `pluginData ("${PLUGIN_DATA_KEYS.componentKey}") in Figma and pass it as ` +
      `figmaComponentKey, or use search_components to find a real match. ` +
      `Do not invent a component.`,
  };
}

/** Explicit failure over guessing (§6.4.1). */
export function noMatchForKey(figmaComponentKey: string): GetComponentContextOutput {
  return {
    found: false,
    confidence: "none",
    warning:
      `No verified manifest mapping exists for component key "${figmaComponentKey}". ` +
      `Do not invent a component — either ask the user or call search_components ` +
      `to present real options.`,
  };
}

/**
 * A resolved, exact-confidence entry. Composes deprecated/stale warnings so they're
 * impossible to miss (§6.4.4, §6.4.5). `staleness` is optional: the MCP server
 * always supplies it; a plugin preview may omit it (staleness UI is a later phase).
 */
export function contextForEntry(
  entry: ComponentManifestEntry,
  staleness?: Staleness,
): GetComponentContextOutput {
  const notes: string[] = [];
  if (entry.status === "deprecated") {
    notes.push(
      `This maps to a DEPRECATED component (${entry.figmaComponentName}). It still ` +
        `resolves, but consider whether a current component is the right target.`,
    );
  }
  if (staleness?.isStale) {
    notes.push(
      `Mapping is STALE: the code component's props have changed since this mapping ` +
        `was last synced (${entry.lastSyncedAt}). Verify props before relying on them; ` +
        `run validate_mapping for the exact diff.`,
    );
  }
  return {
    found: true,
    confidence: "exact",
    entry,
    ...(staleness ? { staleness } : {}),
    ...(notes.length ? { warning: notes.join(" ") } : {}),
  };
}
