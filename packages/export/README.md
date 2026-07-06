# @ui-organized/export

Turns a DTCG **project document** into platform output — CSS custom properties
today, with the resolved-token feed Storybook documentation reads from.

The **resolver is authoritative**: every value is produced by
`@ui-organized/resolver`, so references, math, composites, and color modifiers
resolve exactly once and deterministically. Style Dictionary +
`@tokens-studio/sd-transforms` are wired as a parity check — a fixture test
asserts the resolver agrees with Style Dictionary's independent resolution; where
they can't be reconciled (color format), the resolver wins (see `11-export.md`).

## API

```ts
import { exportCss, exportResolvedTokens } from "@ui-organized/export";

const css = exportCss(projectDocument);            // :root + [data-theme="…"]
const tokens = exportResolvedTokens(projectDocument); // flat list for Storybook docs
```

- **Naming**: `--<dot.path → dash>` (e.g. `spacing.space-04` → `--spacing-space-04`).
- **Per-mode**: mode-constant tokens (primitive ramps) emit once on `:root`;
  mode-varying tokens (semantic mappings) emit per mode under `[data-theme="…"]`.

## CLI / CI

`uiorg-export [repoRoot] [outFile]` reads a repo's `tokens/` files and writes CSS.
Copy `templates/tokens-export.yml` into a tokens repo to run it on `tokens/**`
changes in GitHub Actions.

## License

Apache-2.0
