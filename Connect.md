# Figma Code Connect Plugin + MCP Server
## Claude Code Implementation Spec

**Goal:** A Figma plugin + MCP server pair that maps Figma components to real code components (props, source paths, usage snippets), stores that mapping as a git-native manifest, and serves it to AI coding agents so generated code always references real, correct components instead of hallucinating new ones.

This spec assumes integration into the UI Organized manifest layer (shared across Visual Diff, MCP server, and contribution loop) and follows the same GitHub-backed storage pattern used by the Figma Class Manager plugin.

---

## 0. Success Criteria

Before writing code, these are the acceptance bars. Claude Code should validate against these at each phase, not just at the end.

1. **Zero fabricated components** — if the MCP server can't find a confident match for a Figma node, it says so explicitly rather than returning a best-guess/synthesized component.
2. **Prop accuracy** — every prop name/type returned to the agent matches the actual code component's current signature, verified by hash, not by memory of when it was mapped.
3. **Staleness is visible before it's consumed** — a mapping that's drifted from source shows as stale in the plugin UI *before* an agent ever queries it.
4. **Traceable output** — for any code the agent generates from Figma context, you can point to exactly which manifest entry, which hash, and which Figma node produced it.
5. **Round-trip verifiable** — a "preview payload" action in the plugin shows the exact JSON the MCP server would return for the selected node, with no daylight between what a human sees and what the agent gets.

---

## 1. System Architecture

```
┌─────────────────┐      writes pluginData       ┌──────────────────────┐
│  Figma Plugin    │ ────(component key only)───► │   Figma Node         │
│  (mapping UI)    │                                │  (pluginData: {key}) │
└────────┬─────────┘                                └──────────────────────┘
         │
         │ reads/writes manifest via GitHub API
         ▼
┌─────────────────────────────┐
│  manifest/components.json    │  ← source of truth, git-tracked
│  (one entry per component)   │
└────────┬─────────────────────┘
         │ read at request time (cached)
         ▼
┌─────────────────────────────┐        JSON-RPC / MCP tools        ┌──────────────┐
│      MCP Server              │ ◄──────────────────────────────► │  AI Agent     │
│  (get_component_context,     │                                    │ (Claude Code) │
│   search_components, etc.)   │                                    └──────────────┘
└─────────────────────────────┘
```

Key architectural decision: **Figma stores only a pointer (component key), the manifest holds the actual mapping.** This avoids two systems drifting independently and keeps mappings diffable/PR-reviewable in git, consistent with the existing Figma Class Manager and vds-figma-bridge patterns.

---

## 2. Repo Structure

Lives inside the UI Organized monorepo as its own workspace package, alongside the existing Visual Diff and MCP tooling — not a standalone repo. Adjust the exact paths below to match your existing workspace layout (npm/pnpm workspaces); the internal structure of each package stays the same regardless of where it sits in the tree.

```
ui-organized/                          # existing monorepo root
├── packages/
│   ├── visual-diff/                   # existing
│   ├── mcp-server/                    # existing — extend with the tools/manifest below,
│   │   │                              #   don't stand up a second MCP server if one already runs here
│   │   └── src/
│   │       ├── tools/
│   │       │   ├── get-component-context.ts
│   │       │   ├── search-components.ts
│   │       │   ├── validate-mapping.ts
│   │       │   └── list-stale.ts
│   │       ├── manifest-loader.ts
│   │       └── confidence.ts
│   │
│   ├── figma-code-connect-plugin/     # new — Figma plugin (UI + main thread code)
│   │   ├── manifest.json              # Figma plugin manifest (not the component manifest)
│   │   ├── src/
│   │   │   ├── main.ts                # Plugin sandbox code (Figma API access)
│   │   │   ├── ui.tsx                 # Plugin UI (React/preact)
│   │   │   ├── github-client.ts       # Reads/writes manifest via GitHub API
│   │   │   ├── hash.ts                # Prop-signature hashing (shared w/ scanner)
│   │   │   └── preview.ts             # "Preview payload" feature
│   │   └── package.json
│   │
│   └── component-scanner/             # new — code → manifest sync (CLI + CI)
│       ├── src/
│       │   ├── scan-angular.ts        # Extracts prop schemas from Angular components
│       │   ├── scan-react.ts          # (if/when needed for React counterpart)
│       │   ├── manifest-writer.ts     # Diffs and writes manifest/components.json
│       │   └── hash.ts                # Same hashing logic as plugin (must match exactly)
│       └── package.json
│
├── manifest/
│   ├── components.json                # SOURCE OF TRUTH — see schema in Section 3
│   └── latest-hashes.json             # published by scanner CI, used for staleness checks
│
└── shared/
    └── types.ts                       # shared across mcp-server / plugin / scanner packages
```

Practical implications of this placement:
- **The manifest layer is shared infrastructure**, not owned by this feature alone — if Visual Diff or the git-native contribution loop already reads/writes anything under `manifest/`, coordinate the schema (Section 3) with whatever's already there rather than introducing a parallel file.
- **Reuse the existing `mcp-server` package** rather than standing up a second server process — add the four new tools (6.2) to it. If that server already has its own manifest-loading/caching logic for other purposes, extend it instead of duplicating.
- **One GitHub auth scope** for the whole monorepo simplifies the plugin's write flow (4.6) — no need to reason about cross-repo permissions.
- **CI already exists for this repo** (GitHub Pages deploy, etc.) — add the scanner as a job in the existing workflow rather than a new pipeline.

---

## 3. Manifest Schema (Source of Truth)

`manifest/components.json` — array of entries, one per code component. This is the contract every other piece reads and writes against, so define it first and treat it as frozen once agreed.

```typescript
interface ComponentManifestEntry {
  figmaComponentKey: string;        // Figma's stable component key (not node ID — survives file changes)
  figmaComponentName: string;       // human-readable, for search/debugging
  codePath: string;                 // repo-relative path, e.g. "libs/vds-ui-angular/src/lib/button/button.component.ts"
  framework: "angular" | "react" | "swiftui" | "compose";
  importStatement: string;          // e.g. `import { VdsButtonComponent } from '@versaterm-public-safety/vds-ui-angular';`
  selector?: string;                // Angular selector, e.g. "vds-button"
  props: PropDefinition[];
  usageSnippet: string;             // canonical real-world usage example
  customInstructions?: string;      // prop patterns, a11y notes, team conventions
  propSignatureHash: string;        // hash of props[] — used for staleness detection
  lastSyncedAt: string;             // ISO timestamp, set by scanner
  lastVerifiedBy?: string;          // who/what last confirmed this mapping is correct
  status: "active" | "deprecated" | "draft";
}

interface PropDefinition {
  name: string;
  type: string;                     // TS type or Angular @Input type
  required: boolean;
  defaultValue?: string;
  figmaVariantMapping?: string;     // which Figma variant property this corresponds to, if any
  description?: string;
}
```

**Critical rule:** `propSignatureHash` is computed identically by both the `scanner` (from real code) and stored on the manifest entry. The MCP server never trusts the stored hash alone — see Section 8.

---

## 4. Figma Plugin

### 4.1 Plugin Data Model

On any Figma node the user maps, write only:

```typescript
// setPluginData on the node
{
  "figmaCodeConnect:componentKey": "abc123...",  // pointer into manifest
  "figmaCodeConnect:mappedAt": "2026-07-01T..."
}
```

No prop data, no snippets — those live in the manifest and are looked up by key. This keeps the Figma file small and avoids the two-system drift problem described in Section 1.

### 4.2 UI/UX Flow

1. User selects a component instance or main component on canvas, opens plugin.
2. Plugin panel shows current state for the selection:
   - **Unmapped** — search field to find a manifest entry by name/path, "Create new mapping" if none exists
   - **Connected** — shows component name, code path, prop count, last-synced date, green status
   - **Stale** — same as Connected but flagged amber, with a "what changed" diff (see 4.4)
3. Mapping creation: autocomplete against `search-components` (reads manifest, fuzzy match on name/path). No free-text path entry without validation — force selection from a real, scanned entry to prevent typos that silently break lookups.
4. On confirm: plugin writes the `pluginData` pointer, and if this is a genuinely new pairing (Figma node ↔ code component never linked before), writes/updates the manifest entry's `figmaComponentKey` field via the GitHub client (opens a PR, does not commit directly to main — see 4.6).
5. **Preview Payload button** (always visible when Connected): fetches the manifest entry, runs it through the exact serialization the MCP server would produce, displays it in a read-only code block in the plugin panel. This is the trust-building feature from the earlier discussion — make it prominent, not buried in a menu.

### 4.3 Component Scanner / Matcher (in-plugin assist)

To reduce manual searching, the plugin can suggest likely matches: compare the Figma component's name and its variant properties against manifest entries' `figmaComponentName` and `props[].figmaVariantMapping` using simple string similarity. Surface top 3 suggestions above the manual search field. This is a convenience layer only — never auto-confirm a mapping without explicit user action.

### 4.4 Staleness Detection

On plugin load for a Connected node:
1. Read the manifest entry's `propSignatureHash`.
2. Fetch the *current* hash for that code path — either from a cached "latest scan" result (published by CI, see Section 5) or, if configured, a live GitHub API check of the file's last-modified/content hash.
3. If hashes differ: status = Stale. Show a diff of prop names/types added, removed, or changed since `lastSyncedAt`.
4. Stale mappings still resolve through the MCP server (Section 6) but are flagged in the response so the agent — and by extension the person reading its output — knows the context might be outdated.

### 4.5 Dev Mode Annotations (optional, phase 2)

Figma's Plugin API allows writing Dev Mode annotations. Once core mapping is solid, add an annotation showing the linked component name/path directly in Dev Mode so developers see the connection without opening the plugin — mirrors the effect of Figma's native Code Connect badge. Not required for MVP; sequence after Section 4.1–4.4 are working end to end.

### 4.6 GitHub Write Flow

The plugin should never commit directly to `main`. On mapping creation/update:
1. Create a branch (`figma-mapping/{componentKey}-{timestamp}`)
2. Commit the manifest change
3. Open a PR with an auto-generated description (Figma node link, code path, diff of what changed)
4. This routes every mapping change through the same review/contribution loop as the rest of UI Organized — consistent with the git-native pattern already designed.

---

## 5. Manifest Sync CLI (Code → Manifest)

This is what keeps `propSignatureHash` and prop data honest — it reads real code, not what a human remembers about the code.

- Run as a CLI (`npm run scan`) and in CI on every merge to main.
- `scan-angular.ts`: parse `@Input()` decorators (including signal inputs) via the TypeScript compiler API — do not regex-parse component files, use the actual AST so renamed/refactored props are caught reliably.
- For each discovered component, compute `propSignatureHash` from a canonical serialization of `props[]` (sorted by name, stable JSON stringify) so the hash is deterministic and reproducible by both scanner and plugin.
- `manifest-writer.ts` diffs scan results against the current manifest:
  - New component found in code, no manifest entry → create as `status: "draft"`, no Figma mapping yet (nothing to map until a designer links it)
  - Existing entry, hash changed → update `props[]`, bump `propSignatureHash`, leave `figmaComponentKey` untouched (mapping persists, just flagged stale downstream)
  - Component removed from code → mark `status: "deprecated"`, do not delete (preserves history, agent can still be told "this exists but is deprecated" rather than getting a silent 404)
- CI publishes the updated manifest to the branch/PR flow described in 4.6, same review gate.

---

## 6. MCP Server

### 6.1 Transport

Support both:
- **stdio** for local dev / individual use (fastest to build, test first)
- **HTTP (remote)** exposed via your existing Cloudflare Tunnel once stdio is proven — this is what lets the whole team point at one endpoint without local setup

Build stdio first, treat HTTP as an additive transport wrapper around the same tool implementations — don't fork logic between them.

### 6.2 Tools

**`get_component_context`**
```typescript
input: { figmaNodeId: string } | { figmaComponentKey: string }
output: {
  found: boolean;
  confidence: "exact" | "fuzzy" | "none";
  entry?: ComponentManifestEntry;
  staleness?: { isStale: boolean; changedProps?: string[]; lastVerified: string };
  warning?: string;   // populated whenever found=false or confidence != "exact"
}
```
This is the core tool. **If `found: false`, the server must not return a partial or guessed entry** — return the explicit failure shape above so the agent's instructions (see 6.4) can react correctly instead of silently improvising.

**`search_components`**
```typescript
input: { query: string, framework?: string, status?: "active" | "deprecated" | "draft" }
output: { results: Array<{ componentKey, name, codePath, confidence }> }
```
Used both by the plugin's autocomplete and by an agent that wants to browse available components before generating code for an unmapped design.

**`validate_mapping`**
```typescript
input: { figmaComponentKey: string }
output: { isValid: boolean; currentHash: string; storedHash: string; diff?: PropDiff[] }
```
Lets an agent (or a CI job) explicitly check a mapping's health without pulling the full context payload — useful for a pre-flight sanity pass before a large design-to-code batch job.

**`list_stale`**
```typescript
input: {}
output: { staleEntries: Array<{ componentKey, name, lastSyncedAt }> }
```
Operational tool — surfaces drift across the whole manifest, useful for a periodic health-check workflow or dashboard, not typically called mid-generation.

### 6.3 Resources

Expose the manifest itself as a browsable MCP resource (`manifest://components`) so clients that support resource browsing (vs. only tool calls) can inspect available components without a round-trip tool call.

### 6.4 Anti-Hallucination Guardrails

This is the part that directly answers "eliminate hallucinating" — treat it as a first-class design constraint, not an afterthought:

1. **Explicit failure over guessing.** Every tool response has a `found`/`confidence` field. Never synthesize a plausible-looking component entry when there's no real match — an agent given ambiguous silence will fill the gap with an invented one; an agent given `found: false, warning: "no manifest match for this node"` has to say so or ask.
2. **System-prompt-level instruction for the consuming agent** (document this in your MCP server's README / the client-side agent instructions, since MCP itself can't force client behavior): *"When `get_component_context` returns `found: false` or `confidence: 'fuzzy'`, do not invent a component. State that no verified mapping exists and either ask the user or fall back to `search_components` to present real options."*
3. **No confidence inflation.** `confidence: "fuzzy"` should only ever come from genuine near-matches (e.g. name matched but variant props didn't fully align) — never used to paper over a weak match as if it were exact.
4. **Stale ≠ silently fine.** A stale mapping still returns real data (better than nothing) but the `staleness.isStale` flag must be impossible to miss in the payload shape — put it at the top level, not buried.
5. **Deprecated components resolve, with a warning**, rather than 404ing — an agent working from an old Figma file should be told "this maps to a deprecated component; consider X" rather than getting nothing and guessing a replacement.

### 6.5 Confidence Scoring

`confidence.ts` — deterministic, not vibes-based:
- `exact`: Figma node's `pluginData` pointer resolves directly to a manifest entry with matching, current hash
- `fuzzy`: name-similarity match only (used by `search_components` when no direct pointer exists) — always surfaced with the similarity score so the agent/human can judge it
- `none`: no match above threshold

---

## 7. Hallucination & Uncertainty Flagging

Confidence scoring (6.5) tells the server how sure *it* is. This section covers making that uncertainty visible everywhere downstream — in the payload, in generated code, and in a reviewable artifact — so nothing below `exact` confidence can silently pass as verified. Treat this as two independent layers: one deterministic (server-side, authoritative), one self-reported (agent-side, best-effort). Never rely on the self-reported layer alone.

### 7.1 Layer 1 — Deterministic Server Flag (authoritative)

Already structurally present via `confidence` and `staleness` in every `get_component_context` response (6.2). The requirement here is behavioral, not schema: **no tool response is allowed to omit or soften these fields.** Concretely:
- `confidence: "fuzzy" | "none"` must always be accompanied by a non-empty `warning` string explaining *why* — "matched by name similarity (0.78) only, props unconfirmed" not just "low confidence."
- This is the layer that's actually trustworthy, because it's computed from hashes and match logic, not from an agent's self-assessment. Treat Layers 2–4 as supplementary visibility, not substitutes for this one.

### 7.2 Layer 2 — Agent Self-Flagging in Generated Code

Document a required convention for any agent consuming this MCP server (in the server's README and/or a project-level agent-instructions file) so uncertainty survives into the actual diff, not just the chat transcript:

```typescript
// ⚠️ UNVERIFIED COMPONENT MAPPING (confidence: fuzzy)
// Figma node "CardHeader/Variant2" matched to VdsCardComponent by name similarity only.
// Prop mapping not confirmed — verify props before merging.
<VdsCardComponent variant="header" />
```

Instruction to encode for the consuming agent: *"Any component used from a `get_component_context` response with `confidence` below `exact`, or with `staleness.isStale: true`, must be annotated inline with a comment stating the confidence level and reason, placed immediately above the usage."* This is enforced by convention, not by the protocol — MCP has no mechanism to force client output, so treat this as a documented contract the agent is instructed to follow, and verify it (7.4) rather than assuming compliance.

### 7.3 Layer 3 — Structured Uncertainty Log (build artifact)

For any generation run (single component or full page), emit a companion file alongside the generated code:

```typescript
// mapping-warnings.json
interface MappingWarningsLog {
  generatedAt: string;
  figmaSourceUrl: string;
  warnings: Array<{
    figmaNodeId: string;
    figmaNodeName: string;
    confidence: "fuzzy" | "none";
    resolution: "used_anyway" | "asked_user" | "skipped" | "used_search_fallback";
    matchedComponentKey?: string;   // if used_anyway or used_search_fallback
    warningText: string;
  }>;
  staleMappingsUsed: Array<{ componentKey: string; changedProps: string[] }>;
}
```

This is the artifact a reviewer should scan first in any design-to-code PR — it's a flat list of every place the agent wasn't fully sure, rather than requiring someone to re-read the whole diff hunting for risk. Generate it as a standard output of any batch/page-level generation workflow, not just as an ad hoc debugging aid.

### 7.4 Layer 4 — Retroactive Verification Pass

A `verify-generated-code` step (CLI, reusing `validate_mapping` under the hood) that scans a generated file's imports and JSX/template usage against the manifest, and flags:
- Any component import that doesn't resolve to an `exact`-confidence manifest entry
- Any prop usage not present in the entry's `props[]`
- Any Layer 2 annotation that's missing where it should be present (i.e., confidence was below exact but no warning comment was written) — this is what catches an agent that ignored the Section 7.2 instruction

Run this as a CI check on any PR containing agent-generated code that references mapped components, gated the same way lint/type-check gates are — a missing or incorrect flag should fail the check, not just get logged.

### 7.5 Why Layering Matters

Layer 1 is what actually prevents a hallucinated component from entering the payload in the first place — it's the real defense. Layers 2–4 exist because an agent can still choose to use a `fuzzy` or `none` result anyway (sometimes correctly, e.g. the human explicitly said "use your best guess") — in which case the goal shifts from *prevention* to *making that choice visible and auditable* wherever the resulting code ends up. Don't skip Layer 4 on the assumption that Layer 2 alone is sufficient; self-reporting is compliance-dependent and needs a check that doesn't rely on the agent having followed instructions correctly.

---

## 8. Hash-Based Staleness Verification (Cross-Cutting)

Both the plugin and the MCP server need to agree on "is this mapping current." Rather than trusting the manifest's stored `propSignatureHash` blindly at read time everywhere, define one source of truth for the check:

- The **scanner** (Section 5) is the only thing that writes `propSignatureHash` — it always computes it from real, current code.
- The **plugin** and **MCP server** both read the *stored* hash and compare against the *latest scan result* (published artifact from CI, not a live re-scan on every request — keep read paths fast).
- If your CI publishes scan results to a small `manifest/latest-hashes.json` alongside the main manifest on every merge, both plugin and server can diff against that cheaply without needing GitHub API rate-limited live scans.

---

## 9. Deployment

- **Manifest + scanner**: runs as a job in the UI Organized monorepo's existing GitHub Actions pipeline (same one handling GitHub Pages deploy / other CI), following the same GitHub Actions + Tailscale SSH pattern used for TheVoid — scan on merge to main, open mapping-update PRs as needed.
- **MCP server**: this is the existing `packages/mcp-server` for UI Organized, extended rather than replaced. Containerize and run on TheVoid alongside your other services, exposed via Cloudflare Tunnel at a subdomain (e.g. `mcp.uiorganized.com`). stdio mode remains available for local dev without touching the tunnel.
- **Plugin**: standard Figma plugin distribution — published privately first, public if/when UI Organized ships it as part of the toolkit alongside Visual Diff.

---

## 10. Testing & Validation Plan

Do not consider this done until each of these passes:

1. **Golden path**: map a real VDS component end to end (Figma → plugin → manifest PR → merge → MCP `get_component_context` → correct payload). Verify the payload matches Section 6.2's schema exactly.
2. **Drift detection**: manually rename a prop in the real Angular component, re-run scanner, confirm plugin shows Stale with correct diff, confirm MCP response includes `staleness.isStale: true`.
3. **No-match case**: query `get_component_context` for a Figma node that was never mapped — confirm `found: false` with no fabricated data, and that the warning message is clear enough for an agent to act on correctly.
4. **Deprecated case**: mark a component deprecated via scanner (remove from code), confirm mapping still resolves with a deprecation warning rather than erroring.
5. **Preview payload parity**: confirm the plugin's "Preview Payload" output is byte-for-byte what the MCP server actually returns for the same node — any divergence here undermines the entire trust model.
6. **Load test the manifest read path**: confirm the caching layer in `manifest-loader.ts` doesn't hit GitHub's API rate limits under repeated agent queries during a real design-to-code session.
7. **Flagging fidelity (Section 7)**: force a `fuzzy`-confidence generation run and confirm all four layers fire correctly — response carries a `warning`, generated code carries the Layer 2 comment, `mapping-warnings.json` lists the entry, and the Layer 4 verification pass flags it if the Layer 2 comment is deliberately removed in a test fixture.

---

## 11. Phased Build Plan (order Claude Code should follow)

1. **Manifest schema + shared types** (Section 3) — get this reviewed/frozen before anything else, everything depends on it.
2. **Scanner** (Section 5) for one framework only (Angular, since that's the active VDS codebase) — prove hash computation and manifest-writer diffing against a handful of real components.
3. **MCP server tools, stdio only** — add `get_component_context` and `search_components` to the existing `packages/mcp-server`, reading a manually-seeded manifest (skip plugin entirely at this stage). Validate anti-hallucination behavior (Section 6.4) with deliberately unmapped test nodes.
4. **Figma plugin, mapping creation only** — no staleness UI yet, just search/select/confirm writing `pluginData` + opening a manifest PR. Prove the GitHub write flow (Section 4.6) end to end.
5. **Wire scanner output into staleness detection** in both plugin (4.4) and MCP server (`validate_mapping`, `staleness` field).
6. **Flagging layers (Section 7)** — document and enforce the Layer 2 annotation convention, build the Layer 3 `mapping-warnings.json` emitter, and build the Layer 4 `verify-generated-code` CI check. Sequence this right after staleness detection since both rely on the same confidence/staleness fields being reliable first.
7. **Preview Payload feature** — once the above are stable, this is mostly UI work reusing the MCP server's own serialization logic directly (import it, don't reimplement).
8. **HTTP transport + Cloudflare Tunnel deployment** — only after stdio path is fully validated per Section 10.
9. **Dev Mode annotations** (4.5) — polish pass, not blocking.
10. **Public distribution work** (Section 13) — only after Phases 1–9 are proven internally against real VDS usage. Not part of the initial build.

Each phase should end with the relevant checks from Section 10 passing before moving to the next — this is deliberately sequenced so hallucination-prevention and staleness detection are proven early on a small dataset rather than retrofitted after the plugin UI is built.

---

## 12. Open Decisions (resolve before or during Phase 1)

- ~~Confirm whether manifest lives in the VDS repo, the UI Organized repo, or a dedicated repo~~ — **Resolved: lives in the UI Organized monorepo** (Section 2). Coordinate the `manifest/` schema with anything Visual Diff or the contribution loop already reads/writes there before finalizing Section 3.
- Decide fuzzy-match threshold for `confidence: "fuzzy"` vs `"none"` in `search_components` — start conservative (high threshold) and loosen only if it's rejecting genuinely good matches in testing.
- Decide whether deprecated components should have a configurable TTL after which they stop resolving entirely, or persist indefinitely.
- Decide whether Layer 4 verification (7.4) blocks a PR outright on any missing flag, or warns non-blocking initially until the flagging convention is proven reliable in practice.

---

## 13. Public Distribution (Phase 10 — post-internal-validation)

The internal build (Phases 1–9) is scoped to one org, one repo, one manifest, one auth token. Making this usable by any team requires treating the plugin as a generic client against a manifest shape it doesn't own, rather than a tool wired to a specific deployment. Do not start this phase until the internal version has real mileage against VDS usage — the flagging/staleness/confidence behavior (Sections 6–8) needs to be proven correct on a known dataset before it's handed to users whose codebases you can't inspect.

### 13.1 What's Already Reusable As-Is

- The manifest schema (Section 3), the tool contracts (`get_component_context`, `search_components`, etc., Section 6.2), and the confidence/staleness/flagging model (Sections 6.4–6.5, Section 7) are all shape-agnostic — they don't assume anything about *whose* components they describe. This is the core IP of the toolkit and needs no rework.
- The plugin's UI flows (Section 4.2–4.4: search/select/confirm, staleness badges, Preview Payload) are also reusable as-is — they operate against "the configured manifest," not a hardcoded one.

### 13.2 What Requires Rework

**Per-user GitHub auth.** Replace the single hardcoded GitHub client credential (4.6) with OAuth — each user authorizes the plugin against their own GitHub account/org on first use. Scope the OAuth app to request access only to the specific repo they select during onboarding (13.4), not blanket org access.

**Configurable manifest target.** The plugin needs a settings surface (repo, branch, manifest path) instead of an assumed location. Store this as Figma-file-level or plugin-level shared settings (`figma.clientStorage` or team-level plugin settings, whichever Figma's plugin API supports for this use case) so it persists per file/team without re-entering it each session.

**Bring-your-own MCP server.** This is the real architectural shift: the manifest is inherently org-specific, so there is no single shared MCP server to point everyone at. Each adopting team runs their own instance (same deployment pattern as Section 9, just their infrastructure instead of TheVoid). The plugin needs an MCP server URL field in its settings, defaulting to nothing rather than to your instance.

**Framework-agnostic scanning.** Ship the Angular scanner (already built) and add a React scanner as the second reference implementation, since React is the most common target for a general-audience toolkit. Beyond that, define and document a `Scanner` interface (input: source file, output: `PropDefinition[]` + `propSignatureHash`) so Vue/Svelte/other-framework scanners can be community-contributed rather than something you build for every framework yourself. This is where the git-native contribution loop pays off — new scanners go through the same PR review flow as everything else in the repo.

**Onboarding flow.** First-run wizard in the plugin covering, in order: (1) authorize GitHub, (2) select/create the manifest repo + path, (3) enter MCP server URL, (4) run a connectivity check that confirms the manifest is readable and correctly shaped before letting the user proceed to mapping. Fail loudly and specifically here — a malformed or empty manifest at setup time should produce a clear error, not a silent empty state that looks like "no components yet."

### 13.3 Manifest Schema Versioning

Once other teams depend on the manifest shape (Section 3), it becomes a public contract, not an internal implementation detail. Add a `manifestVersion` field at the top level of `components.json` and document a compatibility policy (e.g., additive fields are safe, removals/renames require a version bump) before the first public release — this is much harder to retrofit once external manifests exist in the wild.

### 13.4 Figma Community Listing

If public discovery (vs. just a shareable install link) is the goal, Figma's Community plugin submission has its own review requirements — privacy/permissions disclosure, functional review, and content guidelines. Budget for this as a separate, non-technical checklist item late in the phase, since review turnaround isn't something Claude Code can shortcut.

### 13.5 Documentation as a Deliverable

For a tool other teams self-host, documentation is load-bearing, not optional polish. At minimum: manifest schema reference, MCP server tool contracts (so teams can build their own scanners/clients against it if they don't want the packaged one), the `Scanner` interface for contributing new frameworks, and a setup guide covering the onboarding flow in 13.2. Treat this as its own checklist item in Phase 10, sized similarly to a build task rather than an afterthought at the end.