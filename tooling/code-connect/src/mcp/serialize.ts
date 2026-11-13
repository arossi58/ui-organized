/**
 * Canonical `get_component_context` serialization.
 *
 * The Node-side composition: resolve a key against the loaded manifest, compute
 * staleness from the published hashes, and hand off to the PURE builders in
 * `../serialize-core.ts`. The plugin's Preview Payload imports those same builders,
 * so a human preview and the agent's payload can never diverge.
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

  // A bare node id can't be resolved from the manifest alone — the manifest is
  // keyed by component key, and only the Figma node knows which key it holds.
  if (!figmaComponentKey) {
    return figmaNodeId ? unresolvableNode(figmaNodeId) : missingInput();
  }

  const entry = resolveByKey(loader, figmaComponentKey);
  if (!entry) return noMatchForKey(figmaComponentKey); // fail explicitly, never synthesize

  return contextForEntry(entry, computeStaleness(entry, loader));
}
