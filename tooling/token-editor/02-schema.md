# 02 — Schema & Types

> Goal: extend `packages/schema` so it describes (a) the ui-organized config, (b)
> the DTCG 2025.10 token format, and (c) the **project document** that wraps base
> tokens + sparse overrides + generator recipes. Zod is the single source; all
> TypeScript types are inferred from it.

## What the schema must cover

1. **DTCG token format (2025.10).**
   - Token: `{ $value, $type, $description?, $extensions? }`.
   - Group: nested object of tokens/groups; may carry `$type`, `$description`,
     `$extensions`.
   - Reference syntax: `{group.token}` curly-brace aliases in `$value`.
   - Required `$type` set for the design system: `color`, `dimension`,
     `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`,
     plus composites `typography`, `shadow`, `border`, `transition`, `gradient`,
     `strokeStyle`.
   - Validate names: reject characters Figma forbids in variable names (`.{}`) at
     export time, but allow `.` in DTCG paths internally (paths are structural).

2. **ui-organized config (the opinionated input, not DTCG).**
   - `brand`: one color input (store both OKLCH and hex).
   - `neutral`: enum of the 12 presets (dove, mythical, flint, waterloo, stone,
     cave, juniper, battleship, squirrel, hemp, mavic, shark).
   - `functional`: system-owned, non-configurable (success/warning/danger/info) —
     present in schema but locked.
   - `modes`: open map of named modes (`light`, `dark`, plus arbitrary). Modes
     affect **semantic mappings only**; primitive ramps are mode-constant.
   - `typography`: heading font, body font (Google Fonts ids), type scale (ratio
     input + rounded output values are authoritative), up to 4 weight roles per
     font mapped to raw numeric weights.
   - `spacing`, `radius`: scales producing `--spacing-space-XX` /
     `--border-radius-radius-XX`.
   - `elevation`: two opacity levels — subtle 0.08, medium 0.16.

3. **Project document (the wrapper, authoritative).**
   ```ts
   ProjectDocument {
     version: string                 // doc schema version
     config: UiOrganizedConfig        // opinionated input
     base: DtcgDocument               // generated tokens (output of generators)
     overrides: OverrideLayer         // sparse, keyed by token path + property
     recipes: GeneratorRecipe[]       // how base was produced, for regeneration
     meta: { name, createdAt, updatedAt, schemaVersion }
   }
   ```
   - `OverrideLayer`: `Record<TokenPath, Partial<TokenProps>>`. Sparse. Only
     stores deltas from generated base. This is the non-destructive layer.
   - `GeneratorRecipe`: `{ generator: id, inputs, outputPaths }`. Lets
     regeneration know what each generator owns and what to reconcile.

## Files

```
packages/schema/src/
  dtcg.ts          Zod schemas for DTCG tokens, groups, refs, $type union
  config.ts        Zod schema for UiOrganizedConfig
  project.ts       Zod schema for ProjectDocument, OverrideLayer, recipes
  extensions.ts    $extensions.uiorganized provenance schema
  index.ts         re-exports schemas + inferred types
```

## Rules

- Export both the Zod schema (`DtcgTokenSchema`) and the inferred type
  (`type DtcgToken = z.infer<typeof DtcgTokenSchema>`).
- Provide `parseProjectDocument(input): Result<ProjectDocument, ZodError>` and a
  non-throwing `safeParse` variant. The editor must never crash on a malformed
  document; it surfaces a typed error.
- Provide `migrateProjectDocument(doc)` keyed on `meta.schemaVersion`. Even at v1,
  stub the migration registry so future versions have a home.
- `$extensions.uiorganized` provenance is **optional** everywhere. Validation must
  pass for plain DTCG with no provenance. Removing provenance is legal and only
  disables regeneration.

## Provenance shape (`$extensions.uiorganized`)

```ts
{
  generatedBy?: string        // recipe/generator id
  generatedFrom?: string[]    // input token paths or config keys
  locked?: boolean            // hint only; never enforced as immutable
  ramp?: { family: string; step: number }  // e.g. palette ramp position
}
```

> Provenance is a hint that powers regeneration and UI affordances. It is never
> treated as a hard lock. The user owns the token; the system advises.

## Definition of done

- `parseProjectDocument` round-trips a hand-written sample document.
- A plain DTCG file with zero `$extensions` validates as a legal `base`.
- Type inference compiles with `exactOptionalPropertyTypes` on.
- Vitest covers: valid doc, malformed `$value`, cyclic-looking ref string (string
  validity only — cycle detection is the resolver's job, not the schema's),
  unknown `$type`, and a document missing provenance.

## Escalation triggers

- If the existing `packages/schema` already defines a custom (non-DTCG) config
  format, **extend it** — do not replace. Confirm the existing export surface and
  add DTCG + project-document schemas alongside it.
- If DTCG 2025.10 has shipped a breaking change to reference or `$type` syntax
  since this doc, confirm the current spec before encoding it.
