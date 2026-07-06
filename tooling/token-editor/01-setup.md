# 01 — Setup & Scaffolding

> Goal: stand up the packages and apps the token manager needs inside the existing
> Turborepo/pnpm monorepo. Do not restructure existing packages; add to them.

## Prerequisites

- Node 20+ and pnpm 9+ already in use by the monorepo.
- Existing packages assumed present: `packages/schema`, `packages/utils`,
  `packages/mcp-server`, the component library packages, and the Style Dictionary
  build. If any are missing, stop and confirm before scaffolding a replacement.

## Packages to add / extend

```
packages/
  schema/        (extend) DTCG 2025.10 + ui-organized config, Zod
  resolver/      (NEW)    reference graph, math, composites, color modifiers
  utils/         (extend) palette generator + icon scaling, pure TS
  token-io/      (NEW)    serialize/deserialize project doc, git + supabase adapters
apps/
  token-manager/ (NEW)    the web editor (Vite + React + Ark UI + CVA)
  figma-plugin/  (NEW or extend) push tokens → Figma variables
services/
  oauth-exchange/(OPTIONAL) single stateless function for GitHub OAuth code→token
```

> `resolver`, `schema`, `utils`, and `token-io` are framework-agnostic pure
> TypeScript. They must not import React, Yjs, or any DOM API. The editor and the
> Figma plugin depend on them; they depend on nothing app-specific.

## Commands

```bash
# resolver
mkdir -p packages/resolver/src
cd packages/resolver && pnpm init
# set name to @ui-organized/resolver, type: module, exports ./dist/index.js
pnpm add -D typescript tsup vitest
pnpm add @ui-organized/schema@workspace:*

# token-io
mkdir -p packages/token-io/src
cd packages/token-io && pnpm init  # @ui-organized/token-io
pnpm add @ui-organized/schema@workspace:* @ui-organized/resolver@workspace:*

# editor app
cd apps && pnpm create vite token-manager --template react-ts
cd token-manager
pnpm add @ui-organized/schema@workspace:* @ui-organized/resolver@workspace:* \
        @ui-organized/token-io@workspace:* @ui-organized/utils@workspace:*
pnpm add @ark-ui/react class-variance-authority yjs y-indexeddb \
        @codemirror/state @codemirror/view @codemirror/lang-json codemirror
pnpm add style-dictionary @tokens-studio/sd-transforms
```

## Workspace wiring

- Add each new package to `pnpm-workspace.yaml` if globbing does not already cover
  `packages/*` and `apps/*`.
- Add `build`, `dev`, `test`, `lint`, `typecheck` tasks to each package and wire
  them into `turbo.json` with correct `dependsOn: ["^build"]` ordering so the
  pure-TS packages build before the app.
- Use `tsup` for the pure-TS packages (dual ESM build, `dts: true`).

## TypeScript config

- Each package extends the repo's base `tsconfig`. Pure-TS packages use
  `"lib": ["ES2022"]` (no DOM). The editor app uses `"lib": ["ES2022","DOM"]`.
- Enable `"strict": true`, `"noUncheckedIndexedAccess": true`,
  `"exactOptionalPropertyTypes": true`. The resolver depends on these for safety.

## Licensing

- Every new package: `LICENSE` (Apache-2.0) + `NOTICE` with the trademark line.
- `package.json`: `"license": "Apache-2.0"`, `"publishConfig": {"access":"public"}`,
  scope `@ui-organized`.

## Definition of done

- `pnpm install` clean at root.
- `pnpm -r build` builds all new packages with emitted `.d.ts`.
- `apps/token-manager` runs `pnpm dev` and renders an empty shell importing one
  symbol from each of `schema`, `resolver`, `token-io` without type errors.
- `pnpm -r test` runs (empty suites pass).

## Escalation triggers

- If `packages/utils` already exposes palette/icon logic under a different shape
  than expected, stop and confirm the public API before refactoring.
- If the existing Style Dictionary build lives in a package not named here, do not
  duplicate it — confirm its location and consume it.
