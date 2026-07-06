/**
 * Preview Payload (Connect.md §4.2, §7) — the trust-building feature. Shows the
 * EXACT JSON the MCP server would return for the mapped entry, by calling the same
 * `contextForEntry` builder the server uses (imported, not reimplemented) so there
 * is no daylight between what a human previews here and what the agent gets
 * (§0.5 success criterion 5).
 *
 * Staleness is intentionally omitted at this phase (staleness UI is Phase 5); the
 * server supplies it, and the shape is identical either way.
 */

import { contextForEntry, type ComponentManifestEntry } from "@ui-organized/code-connect/browser";

export function previewPayload(entry: ComponentManifestEntry): string {
  return JSON.stringify(contextForEntry(entry), null, 2);
}
