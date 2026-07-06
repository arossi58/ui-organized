# 13 — Neutral Core & Generator Packs

> Goal: make the token manager a **general-purpose DTCG editor** in which UI
> Organized is the default starting point but never a requirement. The user can
> import, export, and author any DTCG tokens they want with zero UI-Organized
> assumptions. This document is authoritative on neutrality and **amends**
> `02-schema.md` (§3 document model, §config location), `05-token-studio-parity.md`
> (import/export is headline, not a checkbox), and `06-differentiators.md`
> (generators are one pack, not the product).

## The hard rule

The system splits into two strata with a one-way dependency:

```
        generator packs  ──depends on──▶  neutral core
   packs/ui-organized                packages/schema
   (and any future packs)            packages/resolver
                                      packages/token-io
                                      apps/token-manager (core shell)
```

- **The neutral core knows nothing about UI Organized**: not brand-plus-neutral,
  not the 12 presets, not the typescale model, not elevation opacity levels.
- **A generator pack depends on the core; the core never imports a pack.** Packs
  register at runtime; the core discovers them through an interface, never a static
  import.
- A user who never opens a generator gets a pure DTCG editor. The opinionated flow
  is a door they may choose, not a hallway they are forced down.

## What lives where (amends `01`/`02`)

| Package | Contents | Neutral? |
|---|---|---|
| `packages/schema` | DTCG schema, **neutral** ProjectDocument, pack/recipe **interfaces** | yes |
| `packages/resolver` | references, math, composites, color modifiers | yes |
| `packages/token-io` | import/export adapters, reconciler | yes |
| `apps/token-manager` (shell) | editor UI: sets, themes, modes, list/JSON, resolve | yes |
| `packages/utils` | palette/typescale/icon math (pure functions) | yes* |
| `packs/ui-organized` | UI-Organized config schema + generators + presets | **no — the pack** |

> *`packages/utils` stays neutral pure math (e.g. "generate an OKLCH ramp from a
> seed"). The *opinionated choices* (one brand + a 12-option neutral, the specific
> typescale defaults, elevation 8%/16%) live in `packs/ui-organized`, which calls
> utils. **Move `UiOrganizedConfig` out of `packages/schema` and into the pack.**

## Redefined ProjectDocument (amends `02` §3)

The document has a **neutral baseline** with the opinionated parts optional and
present only when a pack is in use.

```ts
ProjectDocument {
  version: string
  meta: { name, createdAt, updatedAt, schemaVersion }

  // --- neutral baseline: always present ---
  sets: TokenSet[]          // the DTCG tokens themselves
  themes: Theme[]           // named set-status combinations
  modes: ModeMap            // named modes (open map)

  // --- optional: present ONLY when a generator pack is active ---
  packs?: PackInstance[]    // { packId, config } — pack-owned config lives here
  recipes?: GeneratorRecipe[]
  overrides?: OverrideLayer
}

type PackInstance = { packId: string; config: unknown }  // validated by the pack
```

- A plain-DTCG user has `meta`, `sets`, `themes`, `modes` — and **none** of
  `packs`, `recipes`, `overrides`. That document must be fully valid and editable.
- The UI-Organized config that was top-level `config` now lives inside an optional
  `PackInstance.config`, validated by the pack's own schema, not the core schema.
- `parseProjectDocument` must accept a document with no `packs`/`recipes`/
  `overrides` and round-trip it unchanged.

## Generator-pack interface (the contract UI Organized implements)

Define in `packages/schema` (types only); implement in `packs/ui-organized`.

```ts
interface GeneratorPack {
  id: string
  name: string
  configSchema: ZodSchema                 // pack-owned opinionated input
  generators: Generator[]
}

interface Generator {
  id: string
  name: string
  inputSchema: ZodSchema
  run(inputs: unknown, ctx: GeneratorContext): GeneratorOutput
}

interface GeneratorOutput {
  tokens: DtcgFragment        // PLAIN DTCG written into a set; user owns it
  recipe: GeneratorRecipe     // provenance for non-destructive regeneration
}
```

- A generator emits **plain DTCG** plus a recipe. Provenance goes in
  `$extensions.<packId>` and is **optional and inert** — removing it only disables
  regeneration; the tokens stay valid.
- The reconciler (`token-io`, see `06` §3) consumes `recipe` + `overrides`. It is
  pack-agnostic: it reconciles any pack's output the same way.
- Packs are loaded via a registry the shell populates at startup. `ui-organized`
  is registered **by default** but can be deselected; the editor remains a pure
  DTCG editor with no pack active.

## Default vs. forced

- On a fresh project the shell offers the UI-Organized pack as the default "start
  here" path (generate a foundation in seconds). This is an offer, not a gate.
- "New empty DTCG project" and "Import file" are equally first-class entry points
  that load **no pack**.
- Nothing in the core, the export pipeline, or the Figma push may require a pack to
  be present.

## Import / export are headline (amends `05`)

Promote these from parity checkboxes to first-class, tested guarantees:

- **Import arbitrary DTCG** (no provenance) → valid document, no pack, fully
  editable.
- **Import Tokens Studio files** ($metadata/$themes/sets) → valid document;
  unknown fields preserved in `$extensions`; lossless re-export on known fields.
- **Export plain DTCG** and Style Dictionary output for a consumer who will never
  touch a `@ui-organized` component.

## Neutrality acceptance tests (must pass)

1. **Cold import → edit → export.** Open a third-party DTCG file, edit a token,
   export. Diff the export: no `packs`/`recipes`/`overrides` added, no
   `$extensions.uiorganized` introduced. Byte-equivalent modulo formatting.
2. **Tokens Studio round-trip.** A real TS export imports, resolves, and
   re-exports losslessly on known fields.
3. **From scratch, no pack.** Create sets/tokens/themes/modes with no pack active;
   export valid plain DTCG.
4. **Strip the pack.** Generate with UI Organized, then remove the pack and delete
   provenance. Tokens remain valid and editable; regeneration is simply
   unavailable; nothing breaks.
5. **Import-boundary lint (structural guarantee).** A CI check (dependency-cruiser
   or eslint `no-restricted-imports`) fails the build if `packages/schema`,
   `packages/resolver`, `packages/token-io`, or the editor **core** import from
   `packs/*`. The dependency arrow points one way only.

## Positioning (carry into copy/marketing)

The pitch is **not** "our themed editor." It is "a free, open, tool-agnostic DTCG
editor that happens to ship a great opinionated starter." UI Organized is a reason
to start here, not a tax you pay forever. This is the more honest and more durable
wedge against Tokens Studio.

## Definition of done

- The five acceptance tests pass in CI, including the import-boundary lint.
- `UiOrganizedConfig` no longer appears in `packages/schema`; it lives in
  `packs/ui-organized` behind the `GeneratorPack` interface.
- A document with no `packs`/`recipes`/`overrides` round-trips through
  `parseProjectDocument`, the editor, and export unchanged.

## Escalation triggers

- If any core feature appears to need pack-specific knowledge to function, stop:
  that is a design smell. The need belongs in the pack or in a neutral abstraction,
  never hardcoded in the core.
- If a Tokens Studio file uses a construct with no clean neutral representation,
  surface it (preserve in `$extensions`) rather than coercing it into a
  UI-Organized shape.
