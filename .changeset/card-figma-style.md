---
"@ui-organized/react": patch
---

Card now matches the Figma card component. The `default` card gains the Figma surface: a 1px `border-primary` hairline on the primary surface, and the corner radius moves to `radius-06` (16px). Cards are now a flex column whose padding size (`sm`/`md`/`lg`) drives both the inset and the gap between sections at the Figma scale (8/12/16px), so `CardHeader`/`CardFooter` no longer add their own margins — they contribute only their divider rule.

The `outlined` variant has been removed: the bordered look is now the `default`, so `variant` is `"default" | "elevated"`. Replace `variant="outlined"` with the default (drop the prop). `padding` is unchanged.
