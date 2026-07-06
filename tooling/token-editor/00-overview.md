# Token Manager — Build Overview

> Seed document for Claude Code. Read this first. It orients every other file in
> this folder, fixes the architecture, and states the non-negotiable principles.
> Do not deviate from the principles without an explicit human decision.

## What this is

The **Token Manager** is the web-based DTCG token editor at the center of UI
Organized. It replaces the role Tokens Studio plays for most teams — visual token
editing, references, themes, git sync, Style Dictionary export, Figma push — but
runs on the open web, decoupled from any design tool, and is free to self-host.

It is a **general-purpose DTCG 2025.10 editor** in which UI Organized is the
default starting point but never a requirement. The user can import, export, and
author any DTCG tokens they want with zero UI-Organized assumptions. The
opinionated `ui-organized` flow (brand + neutral preset, typescale generator,
elevation model) ships as the **default generator pack**, not as the product:
generators emit plain DTCG tokens the user owns entirely, with optional provenance
in `$extensions` that enables non-destructive regeneration and can be removed
without breaking anything. See `13-neutral-core.md` — it is authoritative on the
neutral-core / generator-pack split.

## Scope of this plan

| Area | File |
|---|---|
| Monorepo setup, packages, scaffolding | `01-setup.md` |
| Schema + types (DTCG + config, Zod) | `02-schema.md` |
| Resolver core (references, math, composites) | `03-resolver.md` |
| Web editor app (sets, themes, views, working doc) | `04-editor.md` |
| Tokens Studio feature parity | `05-token-studio-parity.md` |
| Differentiators (win-over features) | `06-differentiators.md` |
| GitHub connection (auth, repo-as-store, PRs) | `07-github.md` |
| Figma plugin (push to variables, reconcile) | `08-figma-plugin.md` |
| Backend (Supabase: schema, RLS, storage) | `09-backend.md` |
| Authentication + sharing (the 4 tiers) | `10-auth-and-sharing.md` |
| Export pipeline (Style Dictionary, DTCG CSS) | `11-export.md` |
| Build sequence (phased, session-by-session) | `12-build-sequence.md` |
| Neutral core & generator packs (tool-agnostic) | `13-neutral-core.md` |
| Security & monitoring (hardening, vuln + health visibility) | `14-security-and-monitoring.md` |
| Legal & compliance (data responsibility, pre-launch gate) | `15-legal-and-compliance.md` |

## Architecture in one diagram

```
                       ┌─────────────────────────────┐        ┌──────────────────────┐
                       │   Token Manager (web app)    │◀──────│ packs/ui-organized    │
                       │   apps/token-manager (shell) │ regis- │ (DEFAULT pack, optional)│
                       │   - Set/theme/mode UI        │ ters   │ brand, neutral×12,     │
                       │   - List view ⇄ JSON view    │        │ typescale, elevation   │
                       │   - Import / export          │        │ — implements           │
                       │   - Yjs working document     │        │   GeneratorPack        │
                       └──────────────┬──────────────┘        └───────────┬──────────┘
                                      │ consumes                          │ depends on
              ┌───────────────────────┼───────────────────────┐          │ (one-way)
              ▼                       ▼                       ▼           ▼
    ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐  (core never
    │ packages/schema  │   │ packages/resolver│   │ packages/token-io│   imports a pack)
    │ DTCG + neutral   │   │ refs, math,      │   │ import/export,   │
    │ ProjectDocument  │   │ composites,      │   │ reconciler       │
    │ + pack interfaces│   │ color modifiers  │   │ (pack-agnostic)  │
    └──────────────────┘   └────────┬─────────┘   └──────────────────┘
                                    │ shared by          ▲
                                    │                    │ pure math (neutral)
              ┌─────────────────────┼──────────┐  ┌──────────────────┐
              ▼                     ▼          ▼  │ packages/utils   │
    ┌──────────────────┐  ┌──────────────────┐ │  │ palette/typescale│
    │ MCP server       │  │ Figma plugin     │ │  │ icon scaling, TS │
    │ resolve_token    │  │ push → variables │ │  └──────────────────┘
    └──────────────────┘  └──────────────────┘ ▼
                                       ┌──────────────────┐
                                       │ Style Dictionary │
                                       │ → DTCG CSS       │
                                       └──────────────────┘

   Persistence (per user path):
     git-native users  → repo is source of truth (GitHub API + Actions)
     non-GitHub users  → Supabase (accounts, projects, share grants, RLS)
     both              → IndexedDB working cache (disposable)
```

## Non-negotiable principles

1. **The project document is the source of truth.** For a plain-DTCG user that is
   just sets + themes + modes. When a generator pack is active, `config` + recipes
   + overrides additionally describe how part of the document was produced. DTCG
   tokens are authoritative output; Figma is a push-only export target, never a
   co-author.

2. **The core is tool-agnostic; UI Organized is a generator pack, never a
   requirement.** The neutral core (schema, resolver, token-io, editor shell) knows
   nothing about brand-plus-neutral, the 12 presets, or the typescale model. Packs
   depend on the core; the core never imports a pack. A user who opens no generator
   gets a pure DTCG editor. See `13-neutral-core.md`.

3. **The repo is the store, not local storage.** For users with a repo, GitHub
   holds the canonical document and history. IndexedDB is only a working cache —
   disposable, re-pullable, never the home of anything important.

4. **One resolver, three consumers.** The resolver in `packages/resolver` is the
   single deterministic implementation of reference + math + composite resolution.
   The editor, the Figma plugin, and the MCP server all import it. Never fork it.

5. **Typed misses over guesses.** Every lookup (token name, alias target, prop,
   import path) returns a typed result or a typed miss. No best-effort fabrication
   anywhere in the chain. This is the structural anti-hallucination mechanism.

6. **Generators emit owned tokens.** A generator writes plain DTCG tokens the user
   owns. Provenance lives in `$extensions.<packId>` and is optional. Removing
   provenance must never break the tokens — it only disables regeneration.

7. **Non-destructive regeneration.** Regeneration reconciles a sparse override
   layer keyed by token path/property. Overrides classify as reapplied, redundant
   (auto-cleared), or stale (user decides). Structural edits (rename/delete)
   detach subtrees into plain authored tokens. Never silently discard user edits.

8. **Backendless by default, hosted by choice.** Tiers 1–2 (repo-native and
   published views) require zero backend. Supabase exists only for non-GitHub
   collaborators and custom share semantics, and is self-hostable so adopters
   never depend on uiorganized.com.

9. **Apache-2.0 + trademark.** Permissive for adoption, brand-protected. Every
   package ships the license. No GPL dependencies in shipped surface.

## Stack (fixed)

- Monorepo: **Turborepo + pnpm**
- Schema/validation: **Zod** (`packages/schema`)
- Token pipeline: **Style Dictionary** + `@tokens-studio/sd-transforms` (MIT)
- Editor UI primitives: **Ark UI / Zag.js**; styling **custom CSS + CVA**, no Tailwind
- Working document: **Yjs** `Y.Doc` (offline today via `y-indexeddb`, realtime-ready)
- Code/JSON view: **CodeMirror 6**
- Backend (hosted tier only): **Supabase** (Postgres + Auth + RLS + Storage)
- Versioning: **Changesets**, publishing under `@ui-organized` to npm
- Privileged pipeline work: **GitHub Actions**

## Colors, type, dimensions (UI Organized pack decisions)

> These are decisions of the **`ui-organized` generator pack**, not the neutral
> core. The core editor imposes none of them; a plain-DTCG user never encounters
> them. They live in `packs/ui-organized` (see `13-neutral-core.md`).

- Colors stored in **OKLCH and hex**. One brand input + one neutral preset (12
  options: dove, mythical, flint, waterloo, stone, cave, juniper, battleship,
  squirrel, hemp, mavic, shark). Functional colors are system-owned and
  non-configurable. Light/dark affect **semantic mappings only**; primitive ramps
  are mode-constant. Schema supports an open map of any number of named modes.
- Elevation: two opacity levels — subtle 8%, medium 16%.
- CSS property naming: `--spacing-space-XX`, `--border-radius-radius-XX`.
- Spacing and border-radius are **separate** Figma variable collections.
- Typography: typescale.com-style generator, Google Fonts API, separate
  heading/body pickers, up to 4 semantic weight roles per font.
- Rounded type-scale values are source of truth; ratios are inputs, not outputs.

## How to use these documents

Work the phases in `12-build-sequence.md`. Each phase names the files to read, the
packages to touch, concrete commands, a definition of done, and escalation
triggers — points where you must stop and ask a human rather than guess.
