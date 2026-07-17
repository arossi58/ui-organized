---
"@ui-organized/tokens": minor
"@ui-organized/utils": minor
"@ui-organized/react": minor
---

Remove build-time and unused packages from the published runtime dependency tree.

`style-dictionary` is a build-time-only tool and is now a devDependency of `@ui-organized/tokens`; it was previously installed by every consumer of `@ui-organized/react`. Also drops the unused `@ui-organized/schema` dependency from `@ui-organized/utils` and `@ui-organized/react`.

No API changes. Consumer install drops from ~253 packages to ~96.
