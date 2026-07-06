# 08 — Figma Plugin

> Goal: push the project's tokens into a Figma file as variables, and update them
> non-destructively on subsequent pushes. This MUST go through the Figma **Plugin
> API**, not REST.

## Why the plugin, not REST

- The Figma **Variables REST API requires a Full seat in an Enterprise org** for
  both read and write — unusable for an open-source audience.
- The **Plugin API supports creating and reading variables on every plan tier**,
  running inside the user's authenticated Figma session. No Figma credentials, no
  backend on the Figma side.
- Consequence: token→Figma sync **cannot be fully automated in CI** for non-
  Enterprise users. It is always a plugin-initiated, human-in-Figma action.

## Direction

- **Push-only.** Config/tokens → Figma. Figma is an export target, never a co-
  author of token values. (The plugin may *read* Figma for the separate component-
  mapping PR flow, but token values flow one way.)

## Mapping (DTCG → Figma variable model)

| DTCG | Figma |
|---|---|
| token set / group | variable **collection** |
| named mode (light/dark/brand) | **mode** within a collection |
| token (`color`/`dimension`/`string`/`bool`) | **variable** (COLOR/FLOAT/STRING/BOOLEAN) |
| reference `{path}` | variable **alias** (`VariableAlias` → target id) |

- Spacing and border-radius are **separate collections** (existing decision).
- Variable names cannot contain `.{}`; transform DTCG paths into Figma-legal names
  and store the mapping (see manifest below).
- Color: resolve OKLCH → sRGB RGBA (0–1) for Figma; the resolver already emits hex
  + oklch, convert hex→RGBA at the boundary.
- Dimensions: `"16px"` → FLOAT `16`.

## Reconciliation (the important part)

Pushing is an **update**, not a recreate. Maintain a **stored id manifest** in the
Figma document (`figma.root.setPluginData` / shared plugin data) mapping each token
path → Figma variable id.

For each incoming token:
- **missing** in Figma → create variable, record id in manifest.
- **present + value changed** for a mode → update value for that mode.
- **present + identical** → no-op.
- **orphan** (in Figma manifest, absent from tokens) → flag for the user; do not
  auto-delete without confirmation.

Match on the stored id, never on name — so a renamed token updates in place
instead of creating a duplicate. This mirrors the MCP server's stored-mapping
discipline.

## Resolution order

- Create/locate referenced variables **before** binding aliases. Reuse
  `packages/resolver`'s dependency graph / topological order so aliases always
  point at an existing variable.

## Confidence + confirmation (component mapping flow)

- When the plugin proposes component or collection mappings, show **confidence
  indicators** and require **explicit human confirmation**.
- For changes that should reach the repo (e.g. an updated mapping manifest), open
  a **GitHub PR via the user's OAuth token** so CI contract + drift tests gate it
  before `main`. Never write to `main` directly.

## Publish caveat

- After writing variables, the **user must manually publish the library** in
  Figma — plugins cannot trigger a library publish, and updated variables must be
  published before other files can consume them. Surface this clearly in the UI.

## Plugin structure

```
apps/figma-plugin/
  manifest.json        # Figma plugin manifest
  src/
    main.ts            # runs in Figma sandbox (figma.variables.* calls)
    ui.tsx             # iframe UI (loads tokens, shows diff + confidence)
    map.ts             # DTCG → Figma mapping + reconciliation
    manifest-store.ts  # stored token-path → variable-id map
```

- `map.ts` and the reconciliation logic import `packages/resolver` and
  `packages/schema`. The plugin is a thin consumer of shared packages plus the
  Figma-specific writing code.
- Load tokens either from the editor handoff or directly from GitHub (the plugin
  authenticates to GitHub the same way the editor does — see `07-github.md`).

## Known Figma cleanup (existing)

- Fix on import/normalize: trailing space on `waterloo`, `dimesnion` typo across
  the 12 dimension variables, `icon-seconadry`. Normalize names through one map so
  the plugin and exports agree.

## Definition of done

- First push creates collections, modes, variables, and aliases correctly.
- Second push after editing a value updates in place (no duplicates), confirmed by
  the stored id manifest.
- Renaming a token in the editor updates the same Figma variable, not a new one.
- Orphans and the publish step are surfaced, never silently actioned.

## Escalation triggers

- Never delete Figma variables or publish without explicit user confirmation.
- If the Figma Plugin API's variable methods have changed since this doc, confirm
  the current API before implementing writes.
