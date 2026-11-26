---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

CodeBlock: code to read and copy, with a header holding a title, the language and a copy button (the library's Clipboard).

- **Highlighting is yours:** pass `highlight(code, language)` returning HTML. Shiki's `codeToHtml` output works as is, and its css-variables theme takes the block's colours, which are component-local `--code-*` properties defaulting to semantic tokens. Without a highlighter the code is plain text. The HTML is inserted as is in every library, so pass only a highlighter that escapes the code.
- **Props:** `lineNumbers` (drawn by a CSS counter, so never copied), `highlightLines` (`"1,3-5"` or an array), `diff` (lines starting `+` or `-`), `wrap`, `maxHeight`, `variant` (`default`, or `terminal`, dark on any page), `copyable`, `copyLabel` and `copiedLabel`.
- **Layout:** a long line scrolls inside the block and never widens what holds it.
- **Angular:** `<div uioCodeBlock [code] [highlight]>`. Its highlighted lines are set through the renderer rather than `[innerHTML]`, whose sanitizer would strip the colours.
- **Core:** the pure line helpers (`buildCodeLines`, `splitHighlightedLines`, `parseLineSpec`, `diffKindOf`) are exported.
