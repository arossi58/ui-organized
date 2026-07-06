# @ui-organized/figma-code-connect-plugin

Figma plugin for UI Organized **Code Connect** ([`Connect.md`](../../Connect.md) §4,
Phase 4 — *mapping creation*). Select a Figma component, link it to a real
`@ui-organized/react` component, and the plugin:

1. writes **only a pointer** onto the node — `figmaCodeConnect:componentKey` +
   `mappedAt` via `setPluginData` (§4.1); no prop data lives in the file, and
2. opens a **manifest PR** via the GitHub API (§4.6) — never committing to the base
   branch — updating that entry's `figmaComponentKey` in `manifest/components.json`.

That manifest is what the [MCP server](../code-connect) serves to coding agents.

## What it does (Phase 4)

- **Selection state** — Unmapped / Connected, driven by the node's pluginData.
- **Search + suggestions** — fuzzy search over the manifest, plus top-3 auto
  suggestions from the component's name and variant properties (§4.3). Matching and
  search reuse the *same scoring* as the MCP server (`@ui-organized/code-connect/browser`).
- **Confirm → PR** — re-reads the manifest for a fresh blob sha, applies the mapping
  with scanner-identical formatting (minimal diff), branches, commits, and opens a PR.
- **Preview Payload** — shows the exact JSON the MCP server would return, built by the
  server's own `contextForEntry` (imported, not reimplemented) so preview == payload
  (§0.5 criterion 5).
- **Staleness (§4.4)** — a Connected node is checked against the scanner's published
  `latest-hashes.json`; if the code's props have drifted since the mapping was made,
  it shows an amber **Stale** badge plus a "what changed" prop diff (added / removed /
  type-changed), using the same `diffProps` the MCP server uses.

Not in this phase (per §11): Dev Mode annotations (§4.5).

## Architecture

Figma splits a plugin across two realms; this package keeps them cleanly separated:

| File | Realm | Responsibility |
| --- | --- | --- |
| [src/code.ts](src/code.ts) | sandbox (`figma` API) | selection, pluginData read/write, settings in `clientStorage` |
| [src/ui.tsx](src/ui.tsx) | iframe (`fetch`, DOM) | the whole UI + flow |
| [src/github-client.ts](src/github-client.ts) | iframe | GitHub read + branch/commit/PR (§4.6) |
| [src/manifest-remote.ts](src/manifest-remote.ts) | pure | parse / mutate / re-serialize the manifest |
| [src/matcher.ts](src/matcher.ts) | pure | suggestion ranking (§4.3) |
| [src/preview.ts](src/preview.ts) | pure | Preview Payload |
| [src/messages.ts](src/messages.ts) | shared | the sandbox ↔ UI message protocol |

## Develop

```bash
pnpm --filter @ui-organized/figma-code-connect-plugin build   # → dist/code.js + dist/ui.html
pnpm --filter @ui-organized/figma-code-connect-plugin dev     # watch
pnpm --filter @ui-organized/figma-code-connect-plugin test
pnpm --filter @ui-organized/figma-code-connect-plugin typecheck
```

Then in Figma: **Plugins → Development → Import plugin from manifest…** → pick this
package's `manifest.json`. On first run, open **⚙ Settings** and enter a GitHub PAT
(repo scope), the repo owner/name, base branch, and manifest path.

The pure logic (manifest mutation, matcher, PR metadata, preview parity) is unit-
tested; the Figma-runtime and GitHub-network paths are exercised interactively.
