---
"@ui-organized/tokens": patch
"@ui-organized/utils": patch
---

Remap the semantic status colors (`success`, `info`, `info-secondary`, `caution`, `error`) to new primitive shades from the theme-builder export, in both the shipped token pipeline and the theme builder's resolver. Dark base now uses the `1700`/`2000`/`300` shade pattern and light uses `1500`/`600`/`2100`; `error-message` is unchanged. The `warning` (cerise) tokens are untouched.
