# 11 — Export Pipeline

> Goal: turn the resolved token document into platform outputs (CSS custom
> properties now; SCSS/JS as config) via Style Dictionary +
> `@tokens-studio/sd-transforms`. Privileged builds run in GitHub Actions.

## Inputs and outputs

- **Input**: the committed token set files in the repo (or the exported DTCG from
  a Supabase-storage project).
- **Output**: DTCG-format CSS custom properties matching the system's naming, plus
  any additional Style Dictionary platforms.

## Naming contract (must match existing system)

- Spacing: `--spacing-space-XX`.
- Border radius: `--border-radius-radius-XX`.
- Colors emitted in both OKLCH and hex where the system expects both.
- Elevation opacity levels: subtle `0.08`, medium `0.16`.
- Modes affect semantic mappings only; emit per-mode CSS (e.g. `:root` +
  `[data-theme="dark"]`) for semantic tokens; primitive ramps once (mode-constant).

## Pipeline

1. Register `@tokens-studio/sd-transforms` (MIT). It provides the transforms TS
   users rely on: math resolution, dimension→px, opacity, line-height,
   font-weight, color modifiers, and DTCG type alignment. Reuse it rather than
   reimplementing transforms.
2. Configure Style Dictionary platforms:
   - `css` → CSS custom properties (primary).
   - `scss`, `js/ts` → optional, config-only additions.
3. Resolve before export using `packages/resolver` semantics. Where Style
   Dictionary and our resolver could disagree (math rounding, OKLCH↔sRGB), the
   **resolver is authoritative**; align sd-transforms config to match, and add a
   test that compares resolver output to Style Dictionary output on a fixture.

## Where it runs

- **GitHub Actions** is the functional backend for privileged pipeline work:
  Style Dictionary builds, Changesets versioning, npm publish under
  `@ui-organized`. This keeps the client-side-only architecture viable at near-zero
  cost.
- A push/PR to the tokens path triggers the build; output artifacts (CSS) are
  committed or published as part of the component library release.

## Storybook documentation feed

- The same Style Dictionary output feeds the Storybook docs: native doc blocks
  (`ColorPalette`, `ColorItem`, `Typeset`, `IconGallery`) plus the custom
  token-driven doc components for spacing, radius, elevation, and state matrices.
- Tokens and their documentation are one pipeline — no separate doc data source.

## Round-trip / parity

- Importing a Tokens Studio file and exporting through this pipeline must produce
  equivalent CSS to what TS users expect, so migration is lossless on known
  fields. Add a fixture-based test for a representative imported file.

## Definition of done

- A committed token change triggers an Actions build that emits CSS custom
  properties with correct naming and per-mode semantics.
- Resolver output and Style Dictionary output agree on the comparison fixture.
- Storybook renders palette/type/spacing/radius/elevation from the generated
  output with no separate data source.

## Escalation triggers

- If sd-transforms behavior diverges from the resolver in a way that can't be
  reconciled by config, stop and decide explicitly which is authoritative for the
  affected transform (default: the resolver) before shipping mismatched output.
