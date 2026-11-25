---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

VideoEmbed: a video behind its poster.

- **How it loads.** Nothing loads until the reader presses play. The poster button then swaps in a `<video controls>` for a file, or an `<iframe>` for a player page. The type is inferred from `src` (`.mp4`, `.webm`, `.ogg` and `.mov` play in `<video>`), or set with `type`.
- **Lightbox.** `lightbox` plays it in a full-screen Dialog instead.
- **Background.** `background` is a muted, looping, decorative video. It is hidden from assistive tech and stays on its first frame under reduced motion.
- **Other props.**
  - `poster`
  - `aspectRatio` (default `16 / 9`)
  - `playLabel` (default "Play {title}")
  - `captions` (a WebVTT file) with `captionsLang`
- **Play button.** It is drawn in CSS on the brand colour, so it needs no icon set.
- **Angular.** It is `div[uioVideoEmbed]`. It writes an iframe's `src` only for an http(s) or relative URL, rather than adding a peer dependency on the platform sanitizer.
