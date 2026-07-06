/**
 * Canonical `get_component_context` serialization (Connect.md §0.5, §4.2, §6.2, §6.4).
 *
 * The Node-side composition: resolve a key against the loaded manifest, compute
 * staleness from the published hashes, and hand off to the PURE builders in
 * `../serialize-core.ts`. The plugin's Preview Payload imports those same builders,
 * so a human preview and the agent's payload can never diverge (§0.5 criterion 5).
 */

import type {
  GetComponentContextInput,
  GetComponentContextOutput,
} from "../schema.js";
import type { ManifestLoader } from "./manifest-loader.js";
import { resolveByKey } from "./confidence.js";
import { computeStaleness } from "./staleness.js";
import {
  contextForEntry,
  missingInput,
  noMatchForKey,
  unresolvableNode,
} from "../serialize-core.js";

export function buildComponentContext(
  loader: ManifestLoader,
  input: GetComponentContextInput,
): GetComponentContextOutput {
  const { figmaComponentKey, figmaNodeId } = input;

  // A bare node id can't be resolved from the manifest alone — Figma stores only
  // the pointer (component key) on the node, not us (§1, §4.1).
  if (!figmaComponentKey) {
    return figmaNodeId ? unresolvableNode(figmaNodeId) : missingInput();
  }

  const entry = resolveByKey(loader, figmaComponentKey);
  if (!entry) return noMatchForKey(figmaComponentKey); // never synthesize (§6.4.1)

  return contextForEntry(entry, computeStaleness(entry, loader));
}
