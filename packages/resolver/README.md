# @ui-organized/resolver

The single deterministic engine that turns a DTCG token document (sets +
overrides, across modes) into fully resolved raw values. The editor, the Figma
plugin, and the MCP server's `resolve_token` all import **this** resolver — it is
never forked.

It is pure TypeScript: no DOM, no framework, no `Date`, no `Math.random`, no
network, no filesystem. Given the same document and mode, the output is
byte-identical. That determinism is what lets every consumer trust it as an
oracle.

Every lookup returns either a resolved value or a **typed miss** — never a
silent fallback (see `ResolveMiss`).

## Status

Phase 0 establishes the public types and the reference-parsing primitive
(`parseReferences`). The full pipeline — set merge, dependency graph, topological
resolution, math evaluation, composite expansion, and color modifiers — lands in
Phase 1 (`03-resolver.md`).

## License

Apache-2.0
