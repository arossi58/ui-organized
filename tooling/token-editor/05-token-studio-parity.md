# 05 — Tokens Studio Feature Parity

> Goal: a concrete, checkable inventory of what Tokens Studio does that the Token
> Manager must match. Treat this as an acceptance checklist. Items marked
> **(commodity)** are CRUD over the document; **(moat)** items are the hard,
> resolver-backed ones already specced elsewhere.

## Token model

- [ ] **24 token types** supported end to end (commodity). Cover the DTCG `$type`
      set in `02-schema.md` plus the composite types. If a Tokens Studio type has
      no DTCG equivalent, map it and record the mapping in `$extensions`.
- [ ] **Token sets** as logical groups, each exportable to its own file
      (commodity). Status per theme: source / enabled / disabled.
- [ ] **List view ⇄ JSON view** dual editing of the same document (commodity).
- [ ] **Groups / nesting** with `$type` and `$description` inheritance (commodity).

## References, math, composites (moat — resolver)

- [ ] **Aliases** `{group.token}` with full chain resolution.
- [ ] **Math expressions** in values, including references inside expressions.
- [ ] **Composite tokens**: typography, shadow, border, transition, gradient.
- [ ] **Color modifiers**: lighten, darken, mix, alpha (OKLCH-based).
- [ ] **Cycle detection** with a clear in-UI error, never a crash or silent value.

## Themes & modes

- [ ] **Themes** as named set-status combinations (commodity).
- [ ] **Multi-brand** via multiple themes (commodity).
- [ ] **Modes** (light/dark/arbitrary) affecting semantic mappings only (moat-ish:
      requires the per-mode merge in the resolver).

## Sync & storage

- [ ] **Git provider sync** (GitHub) — pull, edit, commit/PR (see `07-github.md`).
- [ ] **URL / read-only source** load (publish a token set at a URL).
- [ ] **Branch awareness** — read and target a branch; open PRs against it.
- [ ] **Multi-file** token sets in a repo, with a manifest mapping sets→files.

## Export / transform

- [ ] **Style Dictionary export** via `@tokens-studio/sd-transforms` (see
      `11-export.md`). Match the transforms TS users rely on: math resolution,
      dimension→px, opacity, line-height, font-weight, color modifiers, and the
      DTCG type alignment.
- [ ] **CSS custom properties** output matching the system's naming
      (`--spacing-space-XX`, `--border-radius-radius-XX`).
- [ ] **Multiple platform outputs** (CSS now; SCSS/JS as Style Dictionary
      platforms — config, not new code).

## Figma

- [ ] **Push tokens → Figma variables** via the plugin (see `08-figma-plugin.md`).
- [ ] **Collections + modes** mapping (sets→collections, modes→modes).
- [ ] **Aliases** as Figma variable aliases.
- [ ] **Update/reconcile**, not just create — stored id manifest prevents
      duplicates on rename.

## Import / round-trip

- [ ] **Import a Tokens Studio token file** ($metadata, $themes, set files) and
      convert to a `ProjectDocument`. Preserve unknown fields in `$extensions` so
      round-trip is lossless where possible.
- [ ] **Import plain DTCG** with zero provenance and edit it (generators become
      optional add-ons, not requirements).

## Advanced (defer, but plan the seam)

- [ ] **Graph Engine equivalent** — Tokens Studio's node-based generation. Do NOT
      build a node editor in v1. Our **generators** (see `06-differentiators.md`)
      cover the common cases (palette from one color, scales) declaratively. Record
      this as a future epic; keep generator recipes data-driven so a visual node
      layer could sit on top later.

## Explicitly out of parity scope

- In-Figma documentation panels (Tokens Studio Plus): our docs live in Storybook.
- Their hosted cloud platform's proprietary project model: we use git + Supabase.

## Definition of done

- Every non-deferred box above has a passing test or a manual QA step in
  `12-build-sequence.md`.
- A real Tokens Studio export imports, resolves, and re-exports without data loss
  on known fields.
