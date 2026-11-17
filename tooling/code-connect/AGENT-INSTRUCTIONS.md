# Code Connect — consuming-agent contract

Instructions for any AI agent generating code from the Code Connect MCP server.
MCP cannot force client behavior, so these are a documented
contract the agent is expected to follow — and the Layer 4 `verify` check (below)
enforces the parts that can be checked statically. The rules are also embedded in the
server's `instructions` and each tool's `description`.

## 1. Never invent a component (Layer 1 — §6.4)

- For a Figma link, read the frame with Figma's own MCP server (`get_design_context`), then
  call `get_component` for each component it shows and `get_token` for each Figma variable
  name. `get_figma_frame` returns the frame as JSX, or as the project's Svelte, Vue or
  Angular template, using real components and tokens, but only once the library's
  components are linked to Figma; until then it returns `found: false`. Report anything
  left unmapped or unbound; don't rebuild it by eye.
- If you already hold a node's component set key, use `resolve_figma_components` or
  `get_component_context`. Keys come from Figma itself, written to the manifest by
  `pnpm figma:sync`, and nodes carry no pluginData.
- If it returns **`found: false`** or **`confidence` other than `"exact"`**: do NOT
  synthesize a component. State that no verified mapping exists and either ask the
  user or call `search_components` to present real options.
- Use `importStatement`, `props`, and `usageSnippet` from the returned entry
  verbatim. Do not invent prop names or imports — the `props` array is the component's
  real, current signature.

## 2. Annotate uncertainty inline (Layer 2 — §7.2)

Any component used from a result with `confidence` below `exact`, **or** with
`staleness.isStale: true`, MUST be annotated immediately above the usage with the
confidence level and reason. Use the exact format produced by `buildAnnotation`
(exported from `@ui-organized/code-connect/browser`) so it's detectable:

```tsx
// ⚠️ CODE CONNECT — UNVERIFIED COMPONENT MAPPING (confidence: fuzzy)
// Figma node "CardHeader/Variant2" → CardHeader: matched by name similarity only. Prop mapping not confirmed — verify before merging.
<CardHeader variant="header" />
```

For a stale mapping, note the changed props; for `none`, state there is no match.

## 3. Log uncertainty for the run (Layer 3 — §7.3)

For a batch/page generation, emit a `mapping-warnings.json` next to the output using
`MappingWarningsCollector` — a flat list of every uncertain resolution and every stale
mapping used, so a reviewer can scan risk first.

## 4. It gets verified (Layer 4 — §7.4)

`pnpm --filter @ui-organized/code-connect verify <files…>` scans generated code and
fails on: components imported from `@ui-organized/react` that aren't real manifest
components (hallucinations), props not in a component's signature, and non-exact
(deprecated/stale) usages missing the Layer 2 annotation. Wire it into CI as a gate.
Self-reporting (Layer 2) is compliance-dependent; this check doesn't rely on the agent
having complied.
