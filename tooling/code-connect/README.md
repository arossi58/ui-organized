# @ui-organized/code-connect

Figma **Code Connect** for UI Organized — maps Figma components to real
`@ui-organized/react` components (props, source paths, usage), stores that mapping
as a **git-native manifest**, and serves it to AI coding agents over **MCP** so
generated code references real, correct components instead of hallucinating new
ones.

This package implements **Phases 1–3** of [`Connect.md`](../../Connect.md):

| Phase | What | Where |
| --- | --- | --- |
| 1 | Manifest schema + shared types (the frozen contract) | [`src/schema.ts`](src/schema.ts), [`src/hash.ts`](src/hash.ts) |
| 2 | React scanner (code → manifest) + reconcile + CLI | [`src/scanner/`](src/scanner/), [`scripts/scan.ts`](scripts/scan.ts) |
| 3 | MCP server (stdio) — 4 tools + anti-hallucination guardrails | [`src/mcp/`](src/mcp/) |

The Figma plugin (Phase 4) and the flagging/deploy phases (6–10) are **not** built
yet — this is the "brain" an agent queries.

## The manifest (source of truth)

`manifest/components.json` at the repo root, one entry per **exported** code
component, written **only** by the scanner from real code — never by hand.
`manifest/latest-hashes.json` is published alongside it for fast staleness checks.
A Figma node stores only a *pointer* (the component key); the real mapping lives in
git so it stays diffable and PR-reviewable ([`Connect.md` §1](../../Connect.md)).

The scan is anchored on `packages/react/src/index.ts` (the public export barrel),
**not** on directory names — so every entry's `importStatement` actually resolves,
renamed exports are correct (`Radio/` → `RadioGroup`, `Navigation/` → `NavItem` /
`Sidebar`), and compound subcomponents (`CardHeader`, `PopoverContent`, …) each get
their own mappable entry. `codeName` is the stable code-side identity (the exact
exported symbol); one `.types.ts` file can back several entries.

## Commands

```bash
# Re-scan @ui-organized/react and rewrite the manifest (run on merge to main in CI)
pnpm --filter @ui-organized/code-connect scan

# Run the MCP server over stdio (local / individual use)
pnpm --filter @ui-organized/code-connect mcp

# Run the MCP server over HTTP (remote / team use)
pnpm --filter @ui-organized/code-connect mcp:http

# Tests / typecheck
pnpm --filter @ui-organized/code-connect test
pnpm --filter @ui-organized/code-connect typecheck
```

## MCP tools

| Tool | Purpose |
| --- | --- |
| `get_component_context` | Resolve a Figma component key → import, props, usage, staleness. The core tool. |
| `search_components` | Fuzzy-browse real components by name/path, with similarity scores. |
| `validate_mapping` | Re-scan the code and diff props vs. the stored entry (pre-flight health check). |
| `list_stale` | List every mapping whose code has drifted since last sync. |

Plus the `manifest://components` resource for clients that browse resources.

## Hallucination flagging (`Connect.md` §7)

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

## Consuming-agent contract (anti-hallucination — `Connect.md` §6.4, §7.2)

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

## Transports (`Connect.md` §6.1)

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

## Deployment (`Connect.md` §9)

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
  schema.ts              # Phase 1 — frozen manifest contract + tool I/O types
  hash.ts                # deterministic prop-signature hash (shared w/ future plugin)
  scanner/
    scan-react.ts        # TS-AST extraction of props from @ui-organized/react
    manifest-writer.ts   # pure reconcile: created / updated / deprecated
  mcp/
    manifest-loader.ts   # cached read path (mtime-aware)
    confidence.ts        # deterministic similarity + fuzzy search
    staleness.ts         # cheap hash compare + live re-scan diff
    serialize.ts         # canonical get_component_context payload (Preview Payload reuses this)
    tools.ts             # the 4 tool implementations (transport-agnostic)
    server.ts            # stdio MCP wiring
scripts/scan.ts          # the `scan` CLI
```
