---
"@ui-organized/tokens": patch
"@ui-organized/schema": patch
---

Deprecated the old theme-config pipeline: `transformConfig`, `buildCss`, `semanticColorTokens` and `componentTokens` in `@ui-organized/tokens`, and `themeConfigSchema` and `validateConfig` in `@ui-organized/schema`. It predates the token contract: its semantic names are retired and its output misses tokens the components read. Since `@ui-organized/react-vite` 3, which builds the Theme Builder's `theme.json`, nothing in the system uses it. Nothing is removed yet; each export goes in its package's next major. To build a theme stylesheet, export one from the Theme Builder or use `@ui-organized/react-vite`.
