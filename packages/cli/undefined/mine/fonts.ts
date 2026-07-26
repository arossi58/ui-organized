/**
 * Font configuration exported from the UI Organized Theme Builder.
 *
 * theme.css names these families but cannot load them — a stylesheet @import
 * would sit behind an extra round trip (it's invisible to the browser's preload
 * scanner) and would hard-code a CDN into your tokens. Add the tags below to
 * your document head instead, or use `themeFonts` to generate them at build
 * time — or ignore both and self-host the files.
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap">
 *   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
 *
 * One entry per family, one request each: the Google Fonts endpoint drops an
 * unknown family from a multi-family request silently, answering 200 with that
 * font missing.
 */
export interface ThemeFont {
  family: string;
  /** Ascending and deduplicated, as the css2 endpoint requires. */
  weights: readonly number[];
  href: string;
}

export const themeFonts: readonly ThemeFont[] = [
  {
    family: "Oswald",
    weights: [400, 500, 600, 700],
    href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap",
  },
  {
    family: "Inter",
    weights: [400, 500, 600, 700],
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];
