# 03 — Resolver Core

> Goal: build `packages/resolver`, the single deterministic engine that turns a
> token document (base + overrides, across sets and modes) into fully resolved raw
> values. This is the technical heart. The editor, the Figma plugin, and the MCP
> server's `resolve_token` all import it. It must be pure TypeScript, no DOM, no
> framework, fully unit-tested.

## Responsibilities

1. **Merge** enabled token sets in precedence order into one effective document
   per mode.
2. **Build a dependency graph** of references and detect cycles.
3. **Topologically resolve** references in dependency order.
4. **Evaluate math** expressions in `$value`.
5. **Expand composite tokens** (typography, shadow, border, transition, gradient).
6. **Apply color modifiers** (lighten, darken, mix, alpha) deterministically.
7. Return either a resolved value or a **typed miss** — never a guess.

## Public API

```ts
resolve(doc: EffectiveDocument, opts: { mode: string }): ResolveResult
resolveToken(doc, path, opts): TokenResolution | ResolveMiss
buildGraph(doc): DependencyGraph        // exposed for the editor's dep view
```

```ts
type TokenResolution = {
  path: string
  $type: DtcgType
  raw: ResolvedValue        // e.g. { hex, oklch } for color; number+unit for dim
  references: string[]      // resolved chain, for provenance/UI
}
type ResolveMiss =
  | { kind: 'unknown-token'; path: string; referencedFrom?: string }
  | { kind: 'cycle'; cycle: string[] }
  | { kind: 'type-mismatch'; path: string; expected: DtcgType; got: DtcgType }
  | { kind: 'bad-expression'; path: string; expr: string; reason: string }
```

> Every failure is a typed `ResolveMiss`. Callers decide how to surface it. The
> resolver never substitutes a fallback value silently.

## Algorithm

### 1. Merge sets
- Input is the ordered list of enabled sets (source/enabled/disabled status from
  the active theme). Later sets override earlier by token path. Disabled sets are
  excluded entirely. Produce one flat `Map<path, Token>` per mode.

### 2. Reference graph
- A reference is a `{path}` substring in a string `$value`, or a path inside a
  composite sub-field. Parse all references per token. Build edges token→referent.
- Detect cycles with DFS / coloring. On a cycle, return `{ kind: 'cycle', cycle }`
  for every token in it; do not throw.

### 3. Topological resolution
- Resolve leaves (no references) first, then dependents. A reference resolves to
  the **already-resolved raw value** of its target, not the raw string. Carry the
  resolved chain into `references` for UI.
- A reference to a missing token returns `unknown-token` with `referencedFrom`.

### 4. Math evaluation
- Support `+ - * /`, parentheses, and references inside expressions, e.g.
  `{spacing.base} * 2`. Units: arithmetic operates on the numeric part; the unit
  is carried (reject mixed incompatible units with `bad-expression`).
- Use a **small, sandboxed** expression evaluator. Do NOT use `eval` or `Function`.
  Implement a tiny shunting-yard / Pratt parser over a fixed token set, or vendor a
  vetted expression library with no I/O. Reject anything outside the grammar.

### 5. Composite expansion
- For `typography`, `shadow`, `border`, `transition`, `gradient`: each sub-field
  may itself be a reference or expression; resolve each sub-field through the same
  pipeline, then assemble the composite object. A composite is resolved only when
  all sub-fields resolve; otherwise propagate the first sub-field miss.

### 6. Color modifiers
- Support `lighten(n)`, `darken(n)`, `mix(colorRef, weight)`, `alpha(n)` on color
  values. Operate in **OKLCH** (consistent with the system's color model), then
  emit both `oklch` and `hex` in the resolved value. Modifiers are pure functions
  of inputs — same input, same output, always.

## Color value contract

- Every resolved color carries `{ oklch: string, hex: string }`. Primitive ramps
  are mode-constant; only semantic mappings differ per mode. The resolver does not
  invent ramps — it reads them from the document. Ramp generation lives in
  `packages/utils` (palette generator), not here.

## Determinism requirements

- No `Date`, no `Math.random`, no network, no filesystem. Given the same document
  and mode, output is byte-identical. This is what lets the MCP server and the
  Figma plugin trust the resolver as an oracle.

## Performance

- Resolve the whole document in one pass per mode; memoize resolved tokens.
- Expose incremental `resolveToken` for the editor's live preview without
  re-resolving the entire document on each keystroke.

## Tests (Vitest)

- Leaf, single ref, chained ref (3 deep), self-cycle, mutual cycle.
- Math: precedence, parentheses, ref-in-expr, unit carry, mixed-unit rejection,
  divide-by-zero → `bad-expression`.
- Composites: fully-resolved typography, shadow with a missing sub-ref → miss.
- Modifiers: lighten/darken/mix/alpha snapshot in OKLCH + hex.
- Set merge: precedence order, disabled-set exclusion, per-mode divergence.
- Property: random valid documents resolve without throwing (only typed misses).

## Definition of done

- 100% of the miss kinds are reachable and tested.
- Editor and Figma plugin can both import and call `resolveToken` with no app deps.
- A benchmark resolves a ~2,000-token document in well under 50 ms.

## Escalation triggers

- If math/modifier semantics must match Tokens Studio exactly for import
  compatibility, confirm the exact rounding and OKLCH-vs-sRGB behavior before
  locking snapshots — divergence here breaks round-tripping imported files.
