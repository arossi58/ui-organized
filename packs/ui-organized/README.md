# @ui-organized/pack-ui-organized

The **UI Organized generator pack** — the default (but optional) starting point
for the Token Manager. It implements the neutral `GeneratorPack` interface from
`@ui-organized/schema` and depends on the core; the core never imports it.

Each generator emits **plain DTCG** tokens the user owns, plus a `GeneratorRecipe`
for non-destructive regeneration. Provenance lives in `$extensions["ui-organized"]`
and is optional and inert — removing it only disables regeneration.

Generators (logic reused from `@ui-organized/utils`):

- **brand-palette** — one brand color → a full OKLCH ramp.
- **neutral-preset** — one of the 12 named neutrals → a neutral ramp.
- **typescale** — base size + ratio → rounded type-scale values.
- **spacing** — base unit → the spacing scale.
- **radius** — base unit → the border-radius scale.
- **elevation** — subtle (8%) / medium (16%) shadow tokens.

`generateFoundation(config)` runs them all and returns the merged DTCG plus the
recipes.

## License

Apache-2.0
