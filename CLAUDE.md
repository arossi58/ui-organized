# ui-organized

Design system published for four frameworks off one framework-neutral core.
pnpm@9 workspaces + turbo. Node ESM throughout.

## graphify

Knowledge graph at `graphify-out/`: **13,142 nodes, 24,107 edges, 810 curated communities.**

**The `graphify` binary is at `~/.local/bin/graphify`, which is NOT on this shell's PATH.**
Run `export PATH="$HOME/.local/bin:$PATH"` once per session before the commands below.
Fallback: `$(cat graphify-out/.graphify_python) -m graphify <cmd>`.

Query the graph **before** grepping, globbing, or bulk-reading files for any codebase question:

| Need | Command |
|---|---|
| How does X work / what links A to B | `graphify query "<symbols>" --budget 2000` |
| Blast radius — what breaks if I change X | `graphify affected "<node-id>" --depth 2` |
| Shortest connection between two things | `graphify path "A" "B" --undirected` |
| What is this symbol, and its neighbours | `graphify explain "<node-id>"` |
| Architectural hubs | `graphify god-nodes --top 20` |

Measured at **62x fewer tokens** than reading the corpus. `GRAPH_REPORT.md` is 130 KB — open it
only for a deliberate architecture pass, and `sed -n` a section rather than `cat`.
`graph.json` is 15 MB; never read it directly.

This graph is undirected, but `path` searches directed by default — always pass
`--undirected` or it reports "no path" for pairs that are two hops apart.

**Phrase queries as symbols, not prose.** Start nodes are picked by naive keyword match, so
"how do the four framework libraries share styles" latches onto test constants named `FOUR` and
`LIBRARIES` and returns 146 noisy nodes. `"alertStyles avatarStyles Alert.styles.ts"` returns 38
relevant ones. `explain` and `affected` need a *unique* match — when they report ambiguity, pass
the full node id (e.g. `packages_svelte_src_lib_types_arkforwardable`) from `query` output.

Trust boundaries: ~20% of edges have a dangling endpoint, 206 files (mostly `.svelte`/`.vue`
SFCs) parse only partially, and ~4,000 nodes are isolated. **Presence of an edge is strong
evidence; absence is weak** — confirm any "nothing uses this" conclusion with grep.

### Keeping the graph current

- After editing **code**: `graphify update .` — AST-only, no LLM, no API key, ~1 min.
- After editing **docs**: re-run `/graphify`; `update` never re-extracts semantic files.

⚠️ **`update` and `cluster-only` re-cluster and overwrite the curated community names** with hub
filenames (`public-api.ts`, `SIZES`). They back the old graph up to `graphify-out/<date>/` first.
To restore: map each new community to the old `community_name` its nodes carried in
`graphify-out/<date>/graph.json` (majority vote), write that to `graphify-out/.graphify_labels.json`,
then run `graphify label . --missing-only`, which preserves an existing labels file and
regenerates `graph.json`, `GRAPH_REPORT.md` and `graph.html` from it.

## Repo map

- `packages/` — `core` (framework-neutral CSS + style recipes; source of truth), the four
  libraries `react` `svelte` `vue` `angular`, plus `tokens` `schema` `resolver` `export`
  `token-io` `utils` `cli` `react-vite`, and the data table pair `table-core` + `react-table`.
- `apps/` — `storybook` (component workbench; hosts every quality gate), `marketing`
  (Vite + React Router docs site, **not** Next.js), `builder`, `token-manager`, `figma-plugin`.
- `tooling/` — `code-connect` (Figma↔code manifest + MCP server), `parity` (cross-framework
  DOM parity harness), `storybook-inspector`, `figma-*` plugins, `eslint-config`, `tsconfig`.
- `examples/` — real consumers used as **release gates**: built for real and their rendered
  output asserted, the only thing that catches tree-shaking regressions.
- `manifest/` — generated: `components.json`, `latest-hashes.json`, `test-status.json`.

Every workspace package is `@ui-organized/<dir>`, except `apps/figma-plugin` =
`@ui-organized/figma-token-plugin` and `packs/ui-organized` = `@ui-organized/pack-ui-organized`.

## Commands

```
pnpm build | test | typecheck        # turbo, all workspaces
pnpm lint                            # eslint over the whole repo, direct (turbo lint runs per-package)
pnpm quality                         # all eight gates + aggregate report
pnpm quality:unit|visual|a11y|interaction|browsers    # one gate, React via Storybook
pnpm quality:a11y:frameworks|interaction:frameworks|visual:frameworks   # the other three libraries
pnpm quality --skip-build            # reuse existing Storybook build; much faster
pnpm check:tarballs                  # pack every publishable package, assert its exports resolve inside
pnpm smoke                           # packed-tarball smoke, 9 suites: cli + react/svelte/vue/angular + the four tables
```

Lint, unit, a11y and interaction block — including the `:frameworks` pair, which
run Svelte/Vue/Angular on the parity harness because Storybook depends on
`@ui-organized/react` alone. Visual (both) and cross-browser are advisory: they
report but never fail.

**A gate added to `scripts/quality/run.mjs` is not a gate until it is also added
to `.github/workflows/ci.yml`.** CI invokes the individual `quality:*` scripts
and never bare `pnpm quality`, so the three framework gates above shipped running
on nobody's machine but their author's.

## Gotchas that waste tokens if forgotten

- **CI runs steps as root inside the Playwright container, but `$HOME`
  (`/github/home`) belongs to `pwuser`.** That uid mismatch has broken two
  unrelated things, and the errors named neither: git refused the checkout
  ("dubious ownership"), which made `quality:lint` report the token contract as
  stale because `git diff --exit-code` exits 128 on failure and 1 on a diff; and
  Firefox and WebKit refuse to launch at all. Fixed by `safe.directory` in
  `.github/actions/setup` and `HOME: /root` on the browser steps. If something
  else in CI fails in a way that makes no sense locally, check this third.
- **A CI failure at `quality:aggregate` is almost never about the aggregator.**
  That step is `if: always()`, so it runs even when an earlier step failed —
  "No Storybook build at …/storybook-static/index.json" means `Build Storybook`
  was *skipped* because something before it failed. Read the first red step, not
  the last. (`.github/actions/setup` builds `./packages/*` plus each app's
  dependency closure; a gate that reaches further than that is the usual cause.)
- **Apps consume `dist`, not `src`.** `packages/react`'s `exports` map points only at `dist/`
  with no source condition, so Storybook and marketing load the *built* package. Rebuild the
  package (and restart Storybook) before believing any browser check or screenshot.
- **`@ui-organized/cli`'s `test:smoke` shells out to `pnpm build`.** Never run it concurrently
  with a turbo build — the nested invocation races the outer graph and poisons the turbo cache.
- **`pnpm generate:palette` currently fails.** It reads `tokens-update/core-color.css`, but
  `tokens-update/` is gitignored (`.gitignore:6`) and absent from this working copy. The palette
  outputs (`packages/tokens/src/primitive/core-color.json`, `packages/utils/src/coreColors.ts`,
  `apps/marketing/src/tools/color-palette/constants/defaultPalette.js`) are generated — never
  hand-edit them; restore the source dir first.
- **graphify's detector false-flags token files as secrets** (`token-contract.json`,
  `*-tokens.css`, `tokens-export.yml`). They are design tokens, not credentials — they are simply
  absent from the graph, so read them directly.
- MCP server `code-connect` is registered in `.mcp.json`. It maps Figma components to real React
  components and refuses to guess — honour its `found:false` contract rather than inventing one.
