# @ui-organized/code-connect

Figma **Code Connect** for UI Organized — maps Figma components to real
`@ui-organized/react` components (props, source paths, usage), stores that mapping
as a **git-native manifest**, and serves it to AI coding agents over **MCP** so
generated code references real, correct components instead of hallucinating new
ones. Svelte, Vue and Angular each get their own scan beside React's, so every
library's specs list the props that library really takes.

What's here:

| What | Where |
| --- | --- |
| Manifest schema + shared types (the frozen contract) | [`src/schema.ts`](src/schema.ts), [`src/hash.ts`](src/hash.ts) |
| Scanners (React, Svelte and Vue from their barrels; Angular through the type checker) + reconcile + CLI | [`src/scanner/`](src/scanner/), [`scripts/scan.ts`](scripts/scan.ts) |
| `figma:sync`: links entries to the Figma library file's component keys | [`src/figma/`](src/figma/), [`scripts/figma-sync.ts`](scripts/figma-sync.ts) |
| MCP server (stdio and HTTP): 9 tools + anti-hallucination guardrails | [`src/mcp/`](src/mcp/) |
| AI specs (`/ai/*.md`, `llms*.txt`), from the same builder as `get_component` | [`src/component-spec.ts`](src/component-spec.ts), [`scripts/generate-ai-docs.ts`](scripts/generate-ai-docs.ts) |
| Flagging layers: annotations, the warnings log, the `verify` CLI | [`src/flagging/`](src/flagging/), [`scripts/verify.ts`](scripts/verify.ts) |
| Deployment: Docker + Cloudflare Tunnel | [`deploy/`](deploy/) |

The Figma plugin that was to link components by hand is paused (on disk, but
gitignored). `figma:sync` is the only writer of Figma keys, and it hasn't been run
against the library file yet, so every `figmaComponentKey` is still empty and the
Figma tools answer `found:false`.

## The manifest (source of truth)

`manifest/components.json` at the repo root, one entry per **exported** code
component, written **only** by the scanner from real code — never by hand.
`manifest/latest-hashes.json` is published alongside it for fast staleness checks,
and `manifest/frameworks/*.json` holds the Svelte, Vue and Angular scans. The Figma
side is the component set key Figma already gives each component: `figma:sync`
writes it into the entry, so the mapping lives in git, where it stays diffable and
PR-reviewable, and the reconcile keeps it across every rescan.

The scan is anchored on `packages/react/src/index.ts` (the public export barrel),
**not** on directory names — so every entry's `importStatement` actually resolves,
renamed exports are correct (`Radio/` → `RadioGroup`, `Navigation/` → `NavItem` /
`Sidebar`), and compound subcomponents (`CardHeader`, `PopoverContent`, …) each get
their own mappable entry. `codeName` is the stable code-side identity (the exact
exported symbol); one `.types.ts` file can back several entries.

## Commands

```bash
# Re-scan the libraries and rewrite the manifest (commit the result; the lint gate fails if it's stale)
pnpm --filter @ui-organized/code-connect scan

# Link the manifest to the Figma library file (from the repo root)
FIGMA_TOKEN=… FIGMA_FILE_KEY=… pnpm figma:sync

# Run the MCP server over stdio (local / individual use)
pnpm --filter @ui-organized/code-connect mcp

# Run the MCP server over HTTP (remote / team use)
pnpm --filter @ui-organized/code-connect mcp:http

# Tests / typecheck
pnpm --filter @ui-organized/code-connect test
pnpm --filter @ui-organized/code-connect typecheck
```

## MCP tools

The repo server registers nine. The published `@ui-organized/mcp` registers the six
read tools ([`src/mcp/read-tools.ts`](src/mcp/read-tools.ts)), which need only the
manifest and the tokens; the three mapping-health tools re-scan source a consumer
doesn't have, so they stay here ([`src/mcp/create-server.ts`](src/mcp/create-server.ts)).

| Tool | Purpose | Published |
| --- | --- | --- |
| `search_components` | Fuzzy-browse real components by name/path, with similarity scores. | yes |
| `get_component` | The full spec for one component by exact name: import, props, usage rules. | yes |
| `search_tokens` | Find design tokens by purpose. | yes |
| `get_token` | Check one token by name; also takes a Figma variable name. | yes |
| `get_figma_frame` | Read a Figma frame as code with real components and tokens. `found:false` until components are linked. | yes |
| `resolve_figma_components` | Turn component set keys and property values into imports and markup. | yes |
| `get_component_context` | Resolve a Figma component key → import, props, usage, staleness. | no |
| `validate_mapping` | Re-scan the code and diff props vs. the stored entry (pre-flight health check). | no |
| `list_stale` | List every mapping whose code has drifted since last sync. | no |

The component and Figma tools take a `framework` argument for Svelte, Vue or Angular.
Plus the `manifest://components` resource for clients that browse resources.

## Hallucination flagging

Four layers make uncertainty visible everywhere downstream — the full contract is in
[AGENT-INSTRUCTIONS.md](AGENT-INSTRUCTIONS.md):

- **Layer 1 — deterministic server flags** (authoritative): every tool response
  carries `confidence` / `staleness` / `warning`; no match returns explicit failure.
- **Layer 2 — inline annotations**: `buildAnnotation` / `needsAnnotation` (from
  `@ui-organized/code-connect/browser`) produce the required comment above any
  below-`exact` or stale usage, so uncertainty survives into the diff.
- **Layer 3 — `mapping-warnings.json`**: `MappingWarningsCollector` accumulates every
  uncertain resolution + stale mapping used during a generation run into one
  reviewer-scannable artifact.
- **Layer 4 — `verify` CLI/CI gate**: `pnpm --filter @ui-organized/code-connect verify
  <files…>` statically flags hallucinated imports, unknown props, and non-exact
  usages missing a Layer 2 annotation. Exits non-zero on errors — wire it into CI:

  ```yaml
  - run: pnpm --filter @ui-organized/code-connect verify $(git diff --name-only --diff-filter=d origin/main... | grep -E '\.tsx?$')
  ```

## Consuming-agent contract (anti-hallucination)

MCP cannot force client behavior, so this is the documented contract every agent
querying this server must follow (it is also embedded in the server `instructions`
and each tool's `description`):

> When `get_component_context` returns `found: false` or `confidence` other than
> `"exact"`, **do not invent a component.** State that no verified mapping exists
> and either ask the user or call `search_components` to present real options.
>
> When a result carries `staleness.isStale: true` or a `warning`, annotate the
> generated usage inline with the confidence level and reason, and verify props
> before relying on them.

The server enforces its half structurally: on no match it returns the explicit
failure shape with a `warning`, never a synthesized best-guess entry.

## Transports

The stdio and HTTP entries share one `createMcpServer` factory — identical tools, no
forked logic. Only the transport differs.

- **stdio** ([server.ts](src/mcp/server.ts)) — local/individual use; what `.mcp.json`
  below points at.
- **HTTP / Streamable HTTP** ([http-server.ts](src/mcp/http-server.ts)) — one endpoint
  the whole team points at. Stateless (fresh server + transport per request), so it
  scales horizontally behind a tunnel. `GET /health` for probes; optional bearer auth
  via `CODE_CONNECT_HTTP_TOKEN`.

## Wiring into Claude Code

Local (stdio) — the repo's [`.mcp.json`](../../.mcp.json):

```json
{ "mcpServers": { "code-connect": { "command": "pnpm", "args": ["--filter", "@ui-organized/code-connect", "mcp"] } } }
```

Remote (HTTP), once deployed:

```json
{ "mcpServers": { "code-connect": { "type": "http", "url": "https://mcp.uiorganized.com/mcp", "headers": { "Authorization": "Bearer <token>" } } } }
```

## Deployment

Containerized HTTP server behind a Cloudflare Tunnel — see [deploy/](deploy/):

```bash
# from the repo root
export CODE_CONNECT_HTTP_TOKEN=…            # bearer token for the endpoint
export CLOUDFLARE_TUNNEL_TOKEN=…            # from Cloudflare Zero Trust
docker compose -f tooling/code-connect/deploy/docker-compose.yml up -d
```

The image builds from the monorepo root (so `packages/react` is present for
`validate_mapping`'s live re-scan) and serves the committed `manifest/`. `cloudflared`
publishes it at your subdomain with no inbound ports. stdio remains available for local
dev without touching the tunnel.

## Layout

```
src/
  schema.ts              # frozen manifest contract + tool I/O types
  hash.ts                # deterministic prop-signature hash
  scanner/
    scan-react.ts        # TS-AST extraction of props (React, Svelte, Vue)
    scan-angular.ts      # the same for Angular, through the type checker
    manifest-writer.ts   # pure reconcile: created / updated / deprecated
  figma/                 # REST client, frame → code resolver, figma:sync planner
  mcp/
    manifest-loader.ts   # cached read path (mtime-aware)
    confidence.ts        # deterministic similarity + fuzzy search
    staleness.ts         # cheap hash compare + live re-scan diff
    serialize.ts         # canonical get_component_context payload
    read-tools.ts        # the six read tools, shared with @ui-organized/mcp
    tools.ts             # the mapping-health tool implementations (transport-agnostic)
    create-server.ts     # registers all nine, once, for both transports
    server.ts            # stdio MCP wiring
scripts/scan.ts          # the `scan` CLI
```
