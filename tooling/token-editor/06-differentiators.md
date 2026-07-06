# 06 — Differentiators (Win-Over Features)

> Goal: the reasons a team switches from Tokens Studio. These are not parity items;
> they are where the Token Manager is meaningfully better. Build these as
> first-class, not afterthoughts.

## 1. Free, open, tool-agnostic, self-hostable

- Full functionality on the open web, no Figma required, no paid cloud gate.
- Apache-2.0 + trademark. Self-host the entire stack (editor + Supabase) so teams
  own their data and never depend on uiorganized.com.
- This is the headline. Everything below is why it's also *better*, not just free.

## 2. Generators that emit owned DTCG tokens

The core differentiator. Tokens Studio makes you author tokens (or wire a Graph
Engine). We **generate** the opinionated foundation and hand you plain DTCG you own.

- **Brand palette generator**: one brand color → full OKLCH ramp. Logic lives in
  `packages/utils` (extracted from the standalone palette app), pure TS.
- **Neutral preset**: pick one of 12 (dove…shark) → neutral ramp.
- **Typescale generator**: typescale.com-style. Ratio + base → rounded scale
  values (rounded values are authoritative, ratio is input).
- **Spacing / radius scales** → `--spacing-space-XX` / `--border-radius-radius-XX`.
- **Elevation**: subtle 8% / medium 16% opacity levels.
- Each generator writes plain DTCG into `base` and records a `GeneratorRecipe`.
  Provenance (`$extensions.uiorganized`) is optional and removable.

> The pitch: "Start with a generated, production-ready foundation in seconds, then
> own every token. No node graph to wire, no lock-in to our generators."

## 3. Non-destructive regeneration (the real moat)

Re-running a generator must never clobber user edits. Reconciliation against the
sparse override layer:

- **Reapplied**: override still differs from the new generated base → keep it.
- **Redundant**: override now equals the new generated base → auto-clear it
  (silently, it's a no-op) and tell the user it was absorbed.
- **Stale**: the token the override targeted no longer exists / changed shape →
  **surface to the user** for a decision. Never auto-discard.
- **Structural edits** (rename/delete of a generated token by the user) detach the
  affected subtree into plain authored tokens, severing the generator link.

This is the three-way-merge model (generated base ↔ user overrides ↔ new base).
Implement it in `packages/token-io` as a pure function with exhaustive tests; the
editor only renders the classification and collects decisions on stale cases.

## 4. One resolver, trusted everywhere (anti-hallucination)

- The same `packages/resolver` powers the editor preview, the Figma push, and the
  MCP server's `resolve_token`. AI agents and the plugin get **deterministic
  lookups, not guesses** — a typed miss when something is absent.
- This is a structural guarantee Tokens Studio doesn't offer: the token system is
  an oracle for code generation, not just a design artifact.

## 5. Live, correct Figma push with real reconciliation

- Push tokens → Figma variables with a stored id manifest so updates reconcile
  instead of duplicating on rename (see `08-figma-plugin.md`). Confidence-scored,
  human-confirmed, opens a PR so CI contract/drift tests gate it before `main`.

## 6. Version history that's actually a document model

- Full project-document snapshots (base + overrides + recipes), not just file
  diffs. Continuous autosave in IndexedDB; published history as git commits.
- Because history is structured, "what changed between v3 and v4" can be shown
  semantically (this token's ramp shifted), not just as a JSON diff.

## 7. First-class collaboration without forcing a tool

- Git-native sharing for repo users (free, zero infra), published read-only views,
  and an optional account tier for non-GitHub collaborators (see
  `10-auth-and-sharing.md`). Tokens Studio gates real access control behind its
  paid cloud; ours is self-hostable.

## 8. Storybook-native documentation

- Tokens flow straight into the existing Storybook docs (ColorPalette, Typeset,
  spacing/radius/elevation matrices fed from Style Dictionary output). The token
  system and its documentation are one pipeline.

## Build priority

1, 2, 3, 4 are the durable wins and must ship in the first usable release. 5 and 6
follow. 7 is the hosted-tier work. 8 reuses the existing Storybook setup.

## Definition of done

- A user generates a foundation, overrides three tokens, re-runs the brand
  generator with a new brand color, and sees correct reapplied / redundant / stale
  classification with no silent data loss.
- Exported tokens contain no required provenance; deleting `$extensions` leaves a
  valid, editable DTCG document.
