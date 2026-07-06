# 12 — Build Sequence (Runbook)

> Goal: the order to build in. Each phase names the docs to read, the packages to
> touch, a definition of done, and escalation triggers. Work phases in order;
> do not start a phase until the previous one's DoD is met. Use short-lived
> branches per phase; publish prereleases under a `next` dist-tag throughout.

## Operating guardrails (apply to every phase)

- **One resolver.** Never fork resolution logic; the editor, plugin, and MCP
  server import `packages/resolver`.
- **Typed misses, never guesses.** Any lookup that can fail returns a typed result.
- **Repo is canonical** for repo users; IndexedDB is a disposable cache; Supabase
  never holds a competing copy of repo-user tokens.
- **Permissioned actions require explicit confirmation**: opening/merging PRs,
  changing repo or account settings, deleting Figma variables, publishing a Figma
  library, granting/revoking access, switching a project's `storage_kind`.
- **Pure-TS packages stay pure** (no DOM/React/Yjs in schema/resolver/utils/
  token-io).
- **Never weaken security to pass**: don't disable RLS, don't ship the client
  secret, don't store tokens in `localStorage`/URLs.
- When a case isn't cleanly classifiable (e.g. stale override), **surface it to the
  user** rather than auto-resolving.

## Phase 0 — Foundations
- Read: `00`, `01`, `02`.
- Build: scaffold packages/apps (`01`); extend `packages/schema` with DTCG +
  config + project document (`02`).
- DoD: `pnpm -r build` + `pnpm -r test` green; `parseProjectDocument` round-trips a
  sample; plain DTCG with no provenance validates.

## Phase 1 — Resolver
- Read: `03`.
- Build: `packages/resolver` — merge, graph, topo-resolve, math, composites, color
  modifiers; full miss taxonomy.
- DoD: every `ResolveMiss` kind tested; ~2,000-token doc resolves <50 ms;
  MCP server can import `resolveToken` (wire a smoke test).

## Phase 2 — Editor skeleton (offline, local)
- Read: `04`.
- Build: `apps/token-manager` with Yjs working doc + `y-indexeddb`; sets/themes
  sidebar; list view ⇄ JSON view on one doc; mode switcher; live resolved preview
  via the resolver. No network yet.
- DoD: create set, add token, reference it, switch modes, reload-restores-doc;
  JSON ⇄ list stay in sync.

## Phase 3 — Generators + non-destructive regeneration
- Read: `06` (sections 2–3), `02` (recipes/overrides).
- Build: brand palette, neutral preset, typescale, spacing/radius, elevation
  generators (logic from `packages/utils`); override layer; the three-way-merge
  reconciler in `packages/token-io` (reapplied / redundant / stale; structural
  detach).
- DoD: generate foundation → override 3 tokens → regenerate with new brand color →
  correct classification, zero silent loss; exported tokens valid with
  `$extensions` removed.

## Phase 4 — GitHub connection (repo-as-store)
- Read: `07`.
- Build: device flow auth (memory-only token); GitHub adapter in `token-io`
  (read manifest + set files → ProjectDocument; commit changed files; open PR with
  confirmation); pull/reconcile against cache; file-split layout.
- DoD: auth → read multi-file repo → edit → commit → PR (confirmed) end to end;
  external-change re-pull reconciles.

## Phase 5 — Export pipeline + Storybook feed
- Read: `11`.
- Build: Style Dictionary + sd-transforms; CSS custom properties with correct
  naming + per-mode semantics; Actions build on token changes; Storybook docs fed
  from output; resolver-vs-SD comparison fixture.
- DoD: token change → Actions build → correct CSS; resolver and SD agree on
  fixture; Storybook renders from generated output.

## Phase 6 — Figma plugin
- Read: `08`.
- Build: `apps/figma-plugin`; DTCG→variables mapping; stored id manifest;
  reconciliation (create/update/no-op/orphan); alias ordering via resolver graph;
  confidence + confirmation; PR for manifest changes; publish-step prompt; name
  normalization (fix known typos).
- DoD: first push creates correctly; second push updates in place (no dupes);
  rename updates same variable; orphans + publish surfaced, never auto-actioned.

## Phase 7 — Tokens Studio import / parity sweep
- Read: `05`.
- Build: importer for TS files ($metadata/$themes/sets) → ProjectDocument,
  preserving unknown fields in `$extensions`; walk the parity checklist.
- DoD: a real TS export imports, resolves, and re-exports losslessly on known
  fields; every non-deferred parity box passes.

## Phase 8 — Backend + auth + sharing (hosted tier)
- Read: `09`, `10`.
- Build: Supabase schema + RLS + Storage; Supabase Auth for non-GitHub users;
  Supabase adapter in `token-io`; Tier 3 sharing (invite-by-email, share links
  with expiry, roles); canonical-source enforcement; `docker-compose` self-host;
  optional OAuth-exchange function for hosted GitHub login.
- DoD: non-GitHub user creates + edits a supabase-storage project; viewer can't
  write (RLS-enforced, tested at the DB); revoke removes access; repo-storage
  projects never store `document`; self-host `docker-compose up` works.

## Phase 9 — Hardening + release
- Build: accessibility pass (keyboard nav of tree/sets); error states for every
  resolver miss; conflict-diff UX; version history (snapshots: git commits for repo
  users, compressed blobs for Supabase users); spend-cap/limits doc for hosted tier.
- DoD: a11y checks pass; every miss has a UI state; history browseable; prerelease
  promoted off `next` to a stable release.

## Deferred (post-1.0, keep seams open)
- Tier 4 realtime co-editing (add a Yjs network provider).
- Graph Engine-style visual generator editor on top of data-driven recipes.
- Multi-framework consumers (Vue/Svelte) of the same packages.
- Cross-device working history (Supabase) beyond published history.

## Global definition of done (1.0)
- A user can: generate a foundation, edit and override tokens, sync to a repo,
  export CSS via Actions, push to Figma with correct reconciliation, and share with
  a non-GitHub collaborator under RLS — all self-hostable, all Apache-2.0, with the
  resolver as the single deterministic oracle and no silent data loss anywhere.
