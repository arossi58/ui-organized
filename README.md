# ui-organized

A token-driven design system: design tokens, generation utilities, component
libraries for React, Svelte, Vue and Angular on one shared core, AI tooling for
coding agents, and a Vite plugin that builds Theme Builder themes — plus a
Storybook, a theme builder, and a marketing site.

## Packages

| Package | Description |
| --- | --- |
| [`@ui-organized/react`](packages/react) | React component library built on Ark UI |
| [`@ui-organized/svelte`](packages/svelte) | Svelte 5 component library built on Ark UI |
| [`@ui-organized/vue`](packages/vue) | Vue 3 component library built on Ark UI |
| [`@ui-organized/angular`](packages/angular) | Angular component library built on the Angular CDK |
| `@ui-organized/{react,svelte,vue,angular}-table` | The data table for each library |
| [`@ui-organized/core`](packages/core) | The framework-neutral stylesheets and variant recipes all four share |
| [`@ui-organized/tokens`](packages/tokens) | Design tokens (typed exports + generated CSS variables) |
| [`@ui-organized/schema`](packages/schema) | Zod schemas / types for DTCG token documents |
| [`@ui-organized/utils`](packages/utils) | Color, type-scale, spacing & semantic-token utilities |
| [`@ui-organized/react-vite`](packages/react-vite) | Vite plugin that builds a Theme Builder `theme.json` into your app's CSS |
| [`@ui-organized/cli`](packages/cli) | `uiorg` — applies a theme bundle and checks it actually works; sets up AI agents |
| [`@ui-organized/mcp`](packages/mcp) | MCP server giving AI agents each library's real components and tokens |

The `apps/*` (marketing, builder, storybook) and `tooling/*` workspaces are
private and not published.

## Using it

- [Get started](https://uiorganized.com/docs/get-started) — install and wire up
  the stylesheets.
- `npx @ui-organized/cli theme <bundle.zip>` — apply a Theme Builder export, and
  find out at apply time if it's incomplete.
- [Theming](https://uiorganized.com/docs/theming) — the three ways to re-skin the
  system, and what a complete theme has to define.
- `npx @ui-organized/cli init` — give your coding agent the real components and
  tokens of your library (React, Svelte, Vue or Angular) through rules, specs and
  an MCP server. See [Use with AI](https://uiorganized.com/docs/use-with-ai).

## Develop

```sh
pnpm install
pnpm build        # turbo build, respects the dependency graph
pnpm test
pnpm dev          # watch mode
```

Requires Node >= 20 and pnpm >= 9.

## Release

Versioning and publishing are managed with [Changesets](https://github.com/changesets/changesets).

```sh
pnpm changeset            # describe a change → creates a .changeset/*.md entry
pnpm version-packages     # apply changesets: bump versions + changelogs
pnpm release              # build all, then publish changed packages to npm
```

Publishing requires being a member of the `@ui-organized` npm org and being
authenticated (`npm login`). In CI, set the `NPM_TOKEN` secret — the release
workflow opens a "Version Packages" PR and publishes on merge.

## License

[Apache-2.0](LICENSE)
