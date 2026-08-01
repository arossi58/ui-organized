---
"@ui-organized/tokens": minor
"@ui-organized/react": minor
---

Fix: every popper-positioned overlay computed `z-index: auto`. The whole `--z-index-*` scale was dead code for seven components, and a dropdown opened inside a `<Dialog>` rendered behind it.

`@zag-js/popper` owns the positioner's stacking. It writes an inline `z-index: var(--z-index)` onto the positioner, then fills that variable by reading the popup:

```js
// @zag-js/popper — get-placement.mjs
floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex)
```

So the contract is *style the popup, the positioner inherits*. This package styled the positioner:

```css
.select-positioner { z-index: var(--z-index-popover, 1000); }   /* never applied */
```

zag read `.select-popup`, which declared no `z-index`, hoisted `auto`, and its own inline style outranked the stylesheet rule. Nothing threw and the rule was right there in devtools — the only symptom was an overlay losing to a dialog. zag latches the read after the first open, so it never self-corrects on a later render either.

The declaration moved to the popup in all eight affected components: `Select`, `Combobox`, `Menu`, `ContextMenu`, `Popover`, `HoverCard`, `Tooltip` and the date pickers' popover. `Dialog`, `Sheet` and `Toast` were never popper-positioned and were already correct — which is exactly why a dropdown-in-a-dialog was the case that surfaced this.

**The stacking scale is reordered: anchored surfaces now outrank modal ones.**

| Token | Was | Now |
| --- | --- | --- |
| `--z-index-dialog` | `1100` | `1100` |
| `--z-index-popover` | `1000` | `1200` |
| `--z-index-tooltip` | `1200` | `1300` |
| `--z-index-toast` | `1300` | `1400` |

Ranking popovers *below* dialogs never described a real arrangement. An anchored surface is always spawned from something, and that something is often a dialog, so it has to paint over its own host. The previous order only looked correct because the values were inert.

**If you layer your own overlays against these tokens, re-check them** — a fixed header at `1150` that used to clear every menu no longer does. Reference the tokens rather than the literals; both packages export the scale (`zIndexTokens`, `globalConstantVars()`).

**If you patched this in app CSS**, the `!important` block on `[data-scope]` positioners was the only lever available — no component exposes a `zIndex` prop, and these elements portal to `document.body`, so there is no ancestor to scope to. It can be deleted. Leaving it in place is harmless; it just wins redundantly.

**New regression gate:** `overlayStacking.test.ts` derives the popper-backed positioners from the rendered TSX and fails if any of them declares `z-index`, if any popup omits it, or if the tier order stops putting anchored surfaces above modal ones. A new anchored component has to be declared in it rather than silently inheriting the bug. The token-contract deriver now strips CSS comments too — prose that quotes `var(--z-index)` was otherwise entering the contract as a token every theme had to ship.
