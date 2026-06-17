# UI Organized - Theme Import (Figma plugin)

A two-way bridge between a `theme.json` (from the
[Theme Builder](../../apps/marketing/src/tools/theme-builder)) and Figma **Variables**:

- **Import** — turn a `theme.json` into variable collections.
- **Export** — read your (possibly edited) variables back into a `theme.json` to load
  into the theme builder or use in code.

## Import — what it creates

Four variable collections (matched by name — existing variables are **overwritten
in place**, missing ones are **created**):

| Collection     | Mode(s)        | Contents |
| -------------- | -------------- | -------- |
| **Primitives** | `Value`        | The global color steps the theme actually uses (`primitive.color.*`). |
| **Semantic**   | `Light`, `Dark`| One color per semantic token; each is a Figma **alias** to a Primitive (or a raw literal where the source has no primitive). |
| **Scale**      | `Value`        | `spacing/*`, `radius/*`, `component/*` dimensions. |
| **Typography** | `Value`        | `font/*` (string), `weight/*`, `size/*`, `leading/*` (float). |
| **Icons**¹     | `Value`        | Per icon size, its `size` and optically-corrected `stroke` (e.g. `24px/size`, `24px/stroke`). |

¹ Only created when the theme has **dynamic stroke scaling** enabled (outline icons
with `strokeAdjustment`). Strokes scale with size in code, so the design system has
no static stroke tokens — Figma can't compute them, so the plugin materialises the
size→stroke pairs using the same algorithm the `<Icon>` component uses.

Because semantic colors alias primitives, re-skinning the brand/neutral primitives
re-flows the whole theme — and switching the Semantic collection between **Light**
and **Dark** swaps every color at once.

## Export — variables back to a theme.json

The **Export** tab reads the four collections back into a `theme.json` in the same DTCG
format (semantic colors become `{primitive.color.…}` references again), which you can
copy or download. Parametric metadata that variables can't represent — brand *family*,
type-scale *ratio*, line-heights, icon settings — is stashed in the document on import
and merged back in on export, so a builder → Figma → builder round-trip is lossless.
(A file with no stashed metadata still exports a valid token tree, with default
`$extensions`.)

Load the result back with **Import Theme** in the theme builder's Export panel, or drop
the `theme.json` straight into code.

## Develop

```sh
pnpm --filter @ui-organized/figma-plugin build      # one-off → dist/code.js + dist/ui.html
pnpm --filter @ui-organized/figma-plugin dev        # watch
pnpm --filter @ui-organized/figma-plugin typecheck
```

## Run in Figma

1. Build (above).
2. Figma desktop → **Plugins → Development → Import plugin from manifest…** and pick
   `tooling/figma-plugin/manifest.json`.
3. Run the plugin, drop in / paste your exported `theme.json`, and click **Import**.

The plugin is fully offline — no network access is requested, and it collects or
transmits no data.

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for the Figma Community submission checklist
(build, manifest review, listing assets, QA) and
[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for bundled open-source
attribution (React, Base UI, the icon sets, and Roboto/OFL).
