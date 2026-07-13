---
"@ui-organized/react": patch
---

Card now matches the Figma card component. The `default` card gains the Figma surface: a 1px `border-primary` hairline on the primary surface, and the corner radius moves to `radius-06` (16px) across every variant. Cards are now a flex column whose padding size (`sm`/`md`/`lg`) drives both the inset and the gap between sections at the Figma scale (8/12/16px), so `CardHeader`/`CardFooter` no longer add their own margins — they contribute only their divider rule. The `variant` and `padding` API is unchanged; `outlined` and `elevated` remain as library options.
