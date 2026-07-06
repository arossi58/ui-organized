# 04 — Editor App

> Goal: build `apps/token-manager`, the web editor. React + Ark UI primitives +
> custom CSS/CVA (dogfood the design system). The editor's working document is a
> Yjs `Y.Doc` persisted to IndexedDB; it reads/writes the canonical store via
> `token-io` (see `07-github.md` and `09-backend.md`).

## Layout

```
┌───────────┬───────────────────────────────────┬───────────────┐
│ Sets &    │  Token list  ⇄  JSON (CodeMirror)  │  Inspector /  │
│ Themes    │                                    │  resolved     │
│ sidebar   │  grouped by $type then name        │  preview      │
│           │                                    │               │
│ Modes     │                                    │  Generators   │
│ switcher  │                                    │  panel        │
└───────────┴───────────────────────────────────┴───────────────┘
        Top bar: project name · sync status · mode · publish
```

## Core surfaces

1. **Sets & themes sidebar.**
   - List token sets; toggle status (source / enabled / disabled) per theme.
   - Reorder sets to control precedence (drag, Ark UI).
   - Create/rename/delete sets. A set maps to a logical group in the document and
     to a file at export time (see file-splitting in `07-github.md`).
   - Theme = a named combination of set statuses + active modes. Multi-brand =
     multiple themes.

2. **Mode switcher.** Switch the active mode (light/dark/arbitrary). Editing a
   semantic token edits the mapping for the active mode; primitive ramps are
   mode-constant and the UI makes that visible (ramp edits warn they affect all
   modes).

3. **Token list view.** Grouped by `$type` then name. Inline editors per type:
   - color → OKLCH/hex picker, shows resolved swatch + the ramp position
   - dimension → number + unit
   - typography/shadow/border → composite sub-field editors
   - reference → token picker (typeahead over existing paths; never free text that
     can't resolve)
   - Each row shows resolved value and, if a reference/expression, the chain.

4. **JSON view (CodeMirror 6).** Live DTCG JSON of the active set. Edits sync to
   the same Yjs doc as the list view (one document, two projections). Validate on
   change via `packages/schema`; show typed errors inline, never silently discard.

5. **Inspector / resolved preview.** For the selected token: resolved raw value,
   reference chain, which mode, which set won precedence, and provenance
   (`$extensions.uiorganized`) if present.

6. **Generators panel.** The differentiator. See `06-differentiators.md`. Brand
   palette generator, neutral preset picker, typescale generator, spacing/radius
   scales, elevation. Each generator writes plain DTCG into `base` and records a
   `GeneratorRecipe`. Re-running a generator triggers non-destructive
   reconciliation against the override layer.

## Working document (Yjs)

- Model the `ProjectDocument` as a `Y.Doc`. Use `Y.Map` for config, a `Y.Map`
  tree (or `Y.Map` of `Y.Map`) for `base`, `Y.Map` for `overrides`, `Y.Array` for
  `recipes`.
- Persist locally with `y-indexeddb` (continuous autosave, offline support).
- The Yjs choice is deliberate: it gives offline now and realtime later by adding
  a network provider, with no rearchitecture. Do NOT add a realtime provider in
  v1 — just the IndexedDB provider.
- Undo/redo via `Y.UndoManager` scoped to the document.

## Edit → override flow

- Editing a token that was generated does not mutate `base`. It writes a delta
  into `overrides[path]`. The resolved view merges base + override.
- Editing a non-generated (authored) token edits it directly.
- The UI shows when a value is overridden vs. generated vs. authored.

## State & data flow

- The Yjs doc is the in-memory truth for the session. A thin selector layer
  derives view models (resolved tokens) by calling `packages/resolver` on the
  current doc + active mode. Memoize; use incremental `resolveToken` on edits.
- Never put the OAuth/access token in component state that serializes. Keep it in
  memory only (see `07-github.md`, `10-auth-and-sharing.md`).

## Styling

- Ark UI for behavior (menus, tabs, dialogs, color picker, combobox, tree).
- CVA + per-component CSS with BEM-style classes referencing CSS custom
  properties. No Tailwind. Dogfood UI Organized components where they exist.

## Accessibility

- Full keyboard nav of the token tree and set list. Ark UI provides ARIA
  semantics; verify focus order and that the JSON ⇄ list toggle preserves
  selection.

## Definition of done

- Create a set, add a color token, reference it from another token, switch modes,
  see resolved values update live.
- Edit in JSON view → reflected in list view and vice versa (single Yjs doc).
- Reload the page → document restored from IndexedDB unchanged.
- Override a generated token, re-run its generator → override preserved or flagged
  (see reconciliation in `06-differentiators.md`), never silently lost.

## Escalation triggers

- If a needed Ark UI primitive is missing for a given control, confirm whether to
  build it on Zag.js directly or fall back, rather than introducing a new UI dep.
- Any reconciliation case that can't be classified as reapplied/redundant/stale
  must surface to the user, not be auto-resolved.
