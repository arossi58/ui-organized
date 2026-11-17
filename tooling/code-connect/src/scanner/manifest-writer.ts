/**
 * Manifest writer (Connect.md §5) — reconcile a fresh scan against the current
 * manifest, keeping the scan honest without clobbering human/plugin-owned fields.
 *
 * Diff rules (§5):
 *  - New component in code, no entry        → create as `draft`, no Figma mapping.
 *  - Existing entry, prop hash changed      → update `props`/`propSignatureHash`,
 *                                             bump `lastSyncedAt`, keep the Figma
 *                                             mapping (flagged stale downstream).
 *  - Mapped component removed from code     → mark `deprecated`, never delete
 *                                             (a designer's Figma link resolves to
 *                                             "deprecated" rather than a silent 404).
 *  - Unmapped component removed from code   → drop the entry. Nothing human-authored
 *                                             hangs off it, and an agent asking for
 *                                             it gets `found:false`, which already
 *                                             routes to `search_components`.
 *
 * Human/plugin-owned fields (figmaComponentKey, figmaComponentName,
 * usageSnippet once edited, customInstructions, lastVerifiedBy, and each
 * prop's figmaVariantMapping) are always preserved across a rewrite — the
 * scanner only owns code-derived fields. `pnpm figma:sync` writes
 * figmaVariantMapping onto props the scanner then replaces wholesale, and the
 * lint gate rescans before it diffs, so dropping it here would turn every
 * committed sync into a red CI run that only a rescan (which loses the
 * mappings) could clear.
 *
 * Pure function (no fs) so it's unit-testable; the CLI in scripts/scan.ts does I/O.
 */

import {
  MANIFEST_VERSION,
  entryId,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LatestHashes,
} from "../schema.js";
import type { ScannedComponent } from "./scan-react.js";

export interface ReconcileChange {
  component: string;
  codePath: string;
  kind: "created" | "updated" | "deprecated" | "removed" | "unchanged";
}

export interface ReconcileResult {
  manifest: ComponentManifest;
  latestHashes: LatestHashes;
  changes: ReconcileChange[];
}

/** Status is derived deterministically: mapped → active, unmapped → draft. */
function statusFor(entry: Pick<ComponentManifestEntry, "figmaComponentKey">): "active" | "draft" {
  return entry.figmaComponentKey ? "active" : "draft";
}

export function reconcile(
  existing: ComponentManifest | null,
  scanned: ScannedComponent[],
  now: string,
): ReconcileResult {
  const prevById = new Map<string, ComponentManifestEntry>();
  for (const e of existing?.components ?? []) prevById.set(entryId(e.codePath, e.codeName), e);

  const scannedIds = new Set(scanned.map((s) => entryId(s.codePath, s.codeName)));
  const changes: ReconcileChange[] = [];
  const components: ComponentManifestEntry[] = [];

  // 1. Reconcile every currently-scanned component.
  for (const s of scanned) {
    const prev = prevById.get(entryId(s.codePath, s.codeName));
    if (!prev) {
      components.push({
        figmaComponentKey: "",
        figmaComponentName: s.codeName,
        codeName: s.codeName,
        codePath: s.codePath,
        framework: s.framework,
        importStatement: s.importStatement,
        ...(s.selector ? { selector: s.selector } : {}),
        ...(s.reactName ? { reactName: s.reactName } : {}),
        props: s.props,
        usageSnippet: s.usageSnippet,
        propSignatureHash: s.propSignatureHash,
        lastSyncedAt: now,
        status: "draft",
        ...(s.referencedTypes ? { referencedTypes: s.referencedTypes } : {}),
      });
      changes.push({ component: s.codeName, codePath: s.codePath, kind: "created" });
      continue;
    }

    const codeChanged = prev.propSignatureHash !== s.propSignatureHash;
    const wasDeprecated = prev.status === "deprecated";
    const prevProps = new Map(prev.props.map((p) => [p.name, p]));
    // Scanner-owned like `props`, so the previous value never survives; and
    // written last, as a newly created entry writes it, so every entry has the
    // same key order. It isn't hashed: a shape changing alone is not drift,
    // and leaves `lastSyncedAt` and the change kind alone.
    const { referencedTypes: _previousTypes, ...kept } = prev;
    components.push({
      ...kept,
      // Scanner-owned, code-derived fields are always refreshed:
      codeName: s.codeName,
      framework: s.framework,
      importStatement: s.importStatement,
      ...(s.selector ? { selector: s.selector } : {}),
      ...(s.reactName ? { reactName: s.reactName } : {}),
      // The props are the scanner's, but a prop's Figma variant mapping is the
      // sync's. Same key order as planSync's `{ ...rest, figmaVariantMapping }`,
      // so a synced manifest rescans byte-identical.
      props: s.props.map((p) => {
        const mapping = prevProps.get(p.name)?.figmaVariantMapping;
        return mapping ? { ...p, figmaVariantMapping: mapping } : p;
      }),
      propSignatureHash: s.propSignatureHash,
      // Seed usageSnippet only if none was ever set/edited:
      usageSnippet: prev.usageSnippet?.trim() ? prev.usageSnippet : s.usageSnippet,
      // Only bump the sync timestamp when code actually drifted (keeps diffs quiet):
      lastSyncedAt: codeChanged || wasDeprecated ? now : prev.lastSyncedAt,
      // A component that reappeared in code un-deprecates:
      status: statusFor(prev),
      ...(s.referencedTypes ? { referencedTypes: s.referencedTypes } : {}),
    });
    changes.push({
      component: s.codeName,
      codePath: s.codePath,
      kind: codeChanged || wasDeprecated ? "updated" : "unchanged",
    });
  }

  // 2. Entries whose code vanished → deprecate the mapped, drop the unmapped.
  for (const prev of existing?.components ?? []) {
    if (scannedIds.has(entryId(prev.codePath, prev.codeName))) continue;
    if (!prev.figmaComponentKey) {
      changes.push({
        component: prev.codeName || prev.figmaComponentName || prev.codePath,
        codePath: prev.codePath,
        kind: "removed",
      });
      continue;
    }
    components.push(
      prev.status === "deprecated" ? prev : { ...prev, status: "deprecated" },
    );
    if (prev.status !== "deprecated") {
      changes.push({
        component: prev.codeName || prev.figmaComponentName || prev.codePath,
        codePath: prev.codePath,
        kind: "deprecated",
      });
    }
  }

  components.sort(
    (a, b) =>
      a.codePath.localeCompare(b.codePath) || (a.codeName ?? "").localeCompare(b.codeName ?? ""),
  );

  const hashes: Record<string, string> = {};
  const latestProps: Record<string, typeof scanned[number]["props"]> = {};
  for (const s of scanned) {
    const id = entryId(s.codePath, s.codeName);
    hashes[id] = s.propSignatureHash;
    latestProps[id] = s.props;
  }

  // A scan that changed nothing keeps the previous timestamp, so re-running it
  // leaves the files byte-identical instead of producing a diff of one date.
  const unchanged = existing !== null && changes.every((c) => c.kind === "unchanged");
  const generatedAt = unchanged ? existing.generatedAt : now;

  return {
    manifest: { manifestVersion: MANIFEST_VERSION, generatedAt, components },
    latestHashes: { generatedAt, hashes, props: latestProps },
    changes,
  };
}
