# Storybook Figma-Style Inspector Panel
## Claude Code Implementation Spec

**Goal:** A Storybook addon that visually resembles Figma's right-hand properties/settings panel (variant pills, boolean toggles, grouped property rows) but drives Storybook's **real, live-rendered component** — not a mock. It reads component metadata from the same `manifest/components.json` built for the Figma Code Connect project, so "what properties exist and what they're called" comes from one shared source of truth instead of being redefined per tool.

This lives in the UI Organized monorepo alongside `figma-code-connect-plugin`, `component-scanner`, and `mcp-server`.

---

## 0. Success Criteria

1. **Real render, not simulation** — toggling a control in the panel updates the actual live Storybook preview via real args/props, using the actual component code, not a static mockup of what it might look like.
2. **Visually reads as Figma's panel** — someone familiar with Figma's Dev Mode / properties panel should recognize the layout and interaction pattern immediately (variant pills, boolean switches, grouped sections) without needing it explained.
3. **One manifest, two consumers** — this addon and the MCP server both read `props[]`/`figmaVariantMapping` from the exact same manifest entries. No parallel prop-schema definition anywhere in this addon.
4. **Drift is visible here too** — if a story's actual `argTypes` don't match the manifest's `props[]` for that component, the panel shows it, using the same confidence/staleness model already built for the MCP server (not a reinvented one).
5. **Never blocks on a missing mapping** — a story with no manifest entry still renders normally in Storybook; the panel shows an "unmapped" state with a path to fix it, it doesn't break the story.

---

## 1. Where This Fits

```
Figma ──(Code Connect plugin)──► manifest/components.json ◄──(component-scanner)── real code
                                          │
                       ┌──────────────────┴──────────────────┐
                       ▼                                      ▼
              packages/mcp-server                  packages/storybook-figma-panel
              (AI agents read context)              (humans visually inspect + toggle,
                                                       real Storybook render)
```

Same manifest, two very different consumers: one serves machine context to an agent, this one serves a human a Figma-shaped UI for exploring the same components live. Confidence/staleness logic (Section 6) is shared code between them, not shared concept only.

---

## 2. Repo Structure

```
ui-organized/
├── packages/
│   ├── mcp-server/                        # existing
│   │   └── src/
│   │       └── manifest-core/             # NEW — extract shared logic here (Section 6)
│   │           ├── confidence.ts          # moved from mcp-server, now shared
│   │           ├── staleness.ts
│   │           └── manifest-loader.ts
│   │
│   ├── figma-code-connect-plugin/         # existing
│   ├── component-scanner/                 # existing
│   │
│   └── storybook-figma-panel/             # NEW
│       ├── src/
│       │   ├── manager.tsx                # registers the addon panel with Storybook
│       │   ├── Panel.tsx                  # root panel component
│       │   ├── components/
│       │   │   ├── VariantPropertyRow.tsx # Figma-style variant pill group
│       │   │   ├── BooleanPropertyRow.tsx # Figma-style toggle switch row
│       │   │   ├── TextPropertyRow.tsx    # Figma-style text input row
│       │   │   ├── PropertySection.tsx    # grouped/collapsible section header
│       │   │   └── StatusBadge.tsx        # confidence/staleness/unmapped indicator
│       │   ├── hooks/
│       │   │   ├── useManifestEntry.ts    # resolves current story → manifest entry
│       │   │   └── useLiveArgs.ts         # wraps Storybook's args API
│       │   ├── manifest-resolver.ts       # story ↔ manifest linking logic (Section 3)
│       │   └── figma-tokens.css           # design tokens matching Figma's panel visual language
│       ├── preset.ts                      # Storybook preset — serves manifest.json to the manager UI
│       └── package.json
│
└── manifest/
    └── components.json                    # shared source of truth (unchanged from prior spec)
```

---

## 3. Linking a Story to a Manifest Entry

The addon needs to know which `ComponentManifestEntry` corresponds to the story currently open. Two mechanisms, in priority order:

**3.1 Explicit (preferred, deterministic)**
Story authors set a parameter:
```typescript
// Button.stories.ts
export default {
  title: "VDS/Button",
  component: VdsButtonComponent,
  parameters: {
    figmaCodeConnect: { componentKey: "abc123..." }  // exact manifest key
  }
};
```
This is `confidence: "exact"` by construction — no guessing involved.

**3.2 Implicit fallback (best-effort)**
If no parameter is set, `manifest-resolver.ts` attempts a match on `codePath` (Storybook knows the component's import path via its own metadata) against `manifest/components.json` entries. This reuses the same fuzzy-matching approach as `search_components` in the MCP server (Section 6.2 of the Code Connect spec) — same confidence semantics apply: a resolver match here is `confidence: "fuzzy"`, never silently promoted to `"exact"`.

**3.3 No match**
Panel renders the "Unmapped" state (Section 7) — never fabricates a property panel from Storybook's own inferred `argTypes` alone, since that would defeat the purpose of grounding this in real, verified component data. Storybook's own inferred controls remain available via its default Controls addon; this panel's job is specifically the manifest-verified view.

---

## 4. Figma-Style Panel UI Spec

The core design constraint: **this needs to visually and behaviorally read as "Figma's properties panel," not "a generic form."** Concretely, match these specific patterns rather than approximating them:

| Manifest prop shape | Figma-equivalent control | Behavior |
|---|---|---|
| `figmaVariantMapping` present + enum-like type | Segmented pill group (like Figma's variant property) | Click a pill → immediately updates the arg, live re-render |
| `type: "boolean"` | Toggle switch, right-aligned, label left (Figma's boolean property row) | Flip switch → immediate re-render |
| `type: "string"` / free text | Inline text field, Figma's compact input style | Debounced update (300ms) to avoid re-render thrash on every keystroke |
| `type: "number"` | Stepper input (Figma's numeric field with up/down arrows) | Immediate update on step, debounced on typed entry |
| Nested/grouped props (e.g. all icon-related props) | Collapsible section header, matching Figma's grouped-property sections | Pure UI grouping, no logic implication |

Visual tokens (`figma-tokens.css`): match Figma's actual panel spacing/typography as closely as license/asset constraints allow — 11px labels, dense row height (~32px), right-panel border treatment, hover states on rows. This is explicitly about *recognition*, so don't reinvent the layout grammar; replicate it.

**Status indicators per row:** if a specific prop's value in the manifest doesn't match what Storybook's actual `argTypes` reports for it (Section 6), show a small inline warning icon on that row — not just a global banner — so drift is traceable to the exact property, not just "something's off in this story."

---

## 5. Live Update Mechanism

This is what makes it a real inspection tool rather than a mockup:

- Use Storybook's `useArgs()` hook (manager-api) inside `useLiveArgs.ts` to read the current story's args and dispatch updates.
- Every panel control writes through `updateArgs({ [propName]: newValue })` — this goes through Storybook's actual channel to the preview iframe, which re-renders the real component with the real prop change. No custom rendering path, no simulation layer — the addon is a control surface over Storybook's existing live-render pipeline.
- On initial panel mount for a story, seed control values from the *current* args (which may come from other addons, controls, or story defaults) — the panel should reflect reality, not reset it.

---

## 6. Confidence & Staleness (Shared Logic, Not Reimplemented)

Per Section 2's repo structure, extract `confidence.ts`, `staleness.ts`, and `manifest-loader.ts` out of `packages/mcp-server` into a new `packages/mcp-server/src/manifest-core/` (or a standalone `packages/manifest-core` if it's cleaner to depend on independently) and have **both** the MCP server and this addon import from there.

Rationale: if "is this mapping stale" or "how confident is this match" is computed differently by the AI-facing tool and the human-facing tool, they'll disagree with each other over time, and that disagreement is worse than either tool being simply less accurate — it destroys trust in both at once. One implementation, two consumers, enforced by import graph rather than by convention.

Concretely for this addon:
- On panel load, call the shared `getStaleness(componentKey)` — if `isStale`, render the global `StatusBadge` at the top of the panel plus per-row indicators (Section 4) for the specific changed props.
- Confidence from Section 3's linking (`exact`/`fuzzy`/`none`) uses the shared `confidence.ts` scoring function, not a separate resolver-specific heuristic.

---

## 7. Handling Unmapped / Stale / Deprecated Stories

- **Unmapped:** panel shows "No verified component mapping" with a button that opens `search-components` results (same shared logic as the MCP server tool) so the user can manually link it — writing the `parameters.figmaCodeConnect.componentKey` back into the story file isn't automatable from a running Storybook instance, so this action should generate the exact snippet to paste in, not attempt a file write.
- **Stale:** panel renders fully functional (real props, real controls) but with the staleness banner and per-row warnings from Section 6 — never hide functionality behind a stale flag, since a slightly-out-of-date panel is still more useful than no panel.
- **Deprecated:** manifest entry has `status: "deprecated"` — panel renders with a persistent top-level notice (not dismissible) naming the deprecation, consistent with how the MCP server surfaces deprecated components rather than 404ing on them.

---

## 8. Testing & Validation Plan

1. **Real-render proof**: toggle a variant pill, confirm the actual DOM output in Storybook's preview iframe changes to match the real component's implementation for that variant — not just that an internal state value changed.
2. **Explicit linking**: a story with `parameters.figmaCodeConnect.componentKey` set resolves at `confidence: "exact"` and renders the full panel correctly.
3. **Fallback linking**: a story with no parameter, but a `codePath` matching a manifest entry, resolves at `confidence: "fuzzy"` and is visibly marked as such.
4. **Unmapped case**: a story with no manifest match at all renders the "Unmapped" state without breaking the story's own render.
5. **Staleness parity**: force a staleness condition (rename a prop in code without re-running the scanner) and confirm both this addon and the MCP server report the exact same staleness result, proving the shared-logic extraction (Section 6) actually works and hasn't silently forked.
6. **Deprecated case**: confirm persistent, non-dismissible deprecation notice renders and the panel remains otherwise functional.
7. **Debounce correctness**: confirm text/number field edits don't cause preview re-render thrash on every keystroke, but do commit within the specified debounce window.

---

## 9. Phased Build Plan

1. **Extract shared manifest-core** (Section 6) out of `mcp-server` — do this first since both this addon and any future consumer need a stable import target, and refactoring it after the addon depends on the old location doubles the work.
2. **Story-to-manifest resolver** (Section 3) — explicit parameter path first, fallback matching second. Validate against a handful of real VDS stories before building any UI.
3. **Static panel UI, no live wiring** — build `VariantPropertyRow`, `BooleanPropertyRow`, `TextPropertyRow`, `PropertySection`, `StatusBadge` against hardcoded manifest fixtures, focused entirely on matching Figma's visual language (Section 4). Get this reviewed for visual fidelity before wiring in real data — cheaper to iterate on styling against fixtures than against a live data pipeline.
4. **Wire real manifest data** — connect the resolver (step 2) and confidence/staleness (step 1) into the static panel (step 3).
5. **Live args wiring** (Section 5) — connect panel controls to `useArgs()`, confirm real re-render.
6. **Unmapped/stale/deprecated states** (Section 7) — these are UI states on top of an already-working panel, sequence last since they're edge-case handling rather than core functionality.
7. **Storybook preset packaging** (`preset.ts`) — ensure the manifest is correctly served/accessible to the manager UI in both local dev and any CI-built Storybook (e.g., Chromatic or a static Storybook deploy), since the manager UI runs in a different context than the preview iframe and needs its own path to the manifest data.

---

## 10. Open Decisions

- Where exactly should `manifest-core` live — nested under `mcp-server` (simpler import path today) or promoted to its own top-level package (cleaner if a third consumer shows up later, e.g. a future CLI or dashboard)? Lean toward the standalone package now given this is already the second consumer.
- Should the "generate snippet to paste in" flow for unmapped stories (Section 7) also offer to open a PR directly (reusing the plugin's GitHub write flow from the Code Connect spec, Section 4.6) rather than just showing text to copy?
- Does the fallback resolver (Section 3.2) need a manual override — i.e., if it fuzzy-matches to the *wrong* component, can a user correct it from within the panel, or only by editing the story file's explicit parameter?