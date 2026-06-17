# Publishing to the Figma Community

Checklist to get **UI Organized - Theme Import** approved. Items marked 🖐 are done
in the Figma desktop app / publish form, not in this repo.

## 1. Build the production artifacts

```sh
pnpm --filter @ui-organized/figma-plugin build
```

Produces `dist/code.js` (sandbox) and `dist/ui.html` (UI, fully inlined — JS, CSS,
and the Roboto woff2 fonts as data URIs). The manifest points at both. `dist/` is
gitignored; Figma bundles these local files at publish time.

## 2. Manifest — already review-ready

`manifest.json` is set up to pass review:

- `editorType: ["figma"]` — Variables are a Figma-design feature.
- `documentAccess: "dynamic-page"` — the plugin uses only the **async** variable
  getters (`getLocalVariableCollectionsAsync`, `getLocalVariablesAsync`), as this
  mode requires.
- `networkAccess: { "allowedDomains": ["none"] }` — the plugin makes **no network
  requests**. React, the component library and the fonts are all bundled/inlined.
- **Only stable APIs**, no `enableProposedApi`, no `eval`/remote code, no
  `clientStorage`. (Verified: a scan of `dist/code.js` finds 0 of these.)
- No `permissions` requested — it only touches **local** variables, never
  `figma.teamLibrary`.

## 3. Plugin id 🖐

The `id` in `manifest.json` is a development placeholder. The first time you
**Publish** from Figma desktop (Plugins → Development → *UI Organized - Theme
Import* → Publish…), Figma assigns the official numeric id and writes it back into
`manifest.json`. Commit that change.

## 4. Listing assets 🖐 (prepare before submitting)

- **Plugin icon** — 128 × 128 px PNG.
- **Cover art** — 1920 × 960 px (no essential text near edges).
- **Name**: UI Organized - Theme Import
- **Tagline** (≤ a sentence): e.g. "Import your design tokens into Figma Variables."
- **Description**: what it does (creates/updates Primitives, Semantic [Light/Dark,
  aliased], Scale, Typography, and — when stroke scaling is on — Icons), and how to
  get a `theme.json` (export from the UI Organized theme builder).
- **Tags / category**: Design systems, Tokens, Variables.
- **Support contact**: a real email or URL.

## 5. Data & privacy 🖐

In the publish form, declare that the plugin **does not collect or transmit any
data**. It reads a `theme.json` the user pastes/uploads and writes local Variables;
nothing leaves the document (`networkAccess: none`).

## 6. Pre-submit QA (run in a real Figma file)

- Fresh file → Import: **Primitives, Semantic, Scale, Typography** collections
  appear; Semantic has **Light + Dark** modes; semantic colors show as aliases to
  Primitives; switching mode reflows colors.
- A theme with **stroke adjustment on (outline)** → an **Icons** collection with
  `<size>px/size` + `<size>px/stroke` pairs. With it off, or solid icons → no Icons
  collection.
- **Re-import** the same file → variables update in place (banner counts as
  "Import complete"), no duplicates.
- **Export tab** → "Export from Figma" produces a `theme.json`; Copy and Download
  both work. Import a theme then export it → reproduces it (round-trip), and the
  result loads back into the theme builder via its *Import Theme* control.
- **Error handling** → invalid JSON and non-theme JSON both show the failure
  banner, not a crash.
- Third-party notices: see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## 7. Submit 🖐

Publish from Figma desktop. Optionally add a reviewer note: "Test data: export a
`theme.json` from the UI Organized theme builder, then paste/upload it here."
