---
"@ui-organized/tokens": patch
"@ui-organized/utils": patch
---

The outline (tertiary) button's hover and pressed states are readable again in dark mode. Since tokens 3.5.0 / utils 4.0.0 their white label sat on a fill too light for it: 3.45:1 and 2.70:1 on the default mars theme, and below 4.5:1 for every brand and neutral in dark mode, down to 1.15:1 on candlelight.

The label stays white and the fills get darker. In `variables.css`, dark `--color-interactive-tertiary-hover` moves from `brand.1200` to `brand.1400` and `--color-interactive-tertiary-active` from `brand.1000` to `brand.1500` (5.00:1 and 6.02:1 on mars). Light mode is unchanged.

`resolveSemanticColors` and `resolveSemanticRefs` now treat those two tokens as fills under `--color-content-light`: each walks darker until that label clears 4.5:1, and each state stays a step darker than the one before. They used to be walked as link text toward the light end of the ramp, which was the cause. Light mode resolves exactly as before for every brand. A Theme Builder bundle you already applied keeps the old dark fills until you export it again and re-apply it with `uiorg theme`.
