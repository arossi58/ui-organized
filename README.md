# ui-organized

A token-driven design system: design tokens, a Zod-validated theme schema,
generation utilities, a React component library, and a Vite plugin — plus a
Storybook, a theme builder, and a marketing site.

## Packages

| Package | Description |
| --- | --- |
| [`@ui-organized/react`](packages/react) | React component library built on Ark UI |
| [`@ui-organized/tokens`](packages/tokens) | Design tokens (typed exports + generated CSS variables) |
| [`@ui-organized/schema`](packages/schema) | Zod schemas / types for the theme config |
| [`@ui-organized/utils`](packages/utils) | Color, type-scale, spacing & semantic-token utilities |
| [`@ui-organized/react-vite`](packages/react-vite) | Vite plugin that builds & injects theme tokens |
| [`@ui-organized/cli`](packages/cli) | `uiorg` — applies a theme bundle and checks it actually works |

The `apps/*` (marketing, builder, storybook) and `tooling/*` workspaces are
private and not published.

## Using it

- [Get started](https://uiorganized.com/docs/get-started) — install and wire up
  the stylesheets.
- `npx @ui-organized/cli theme <bundle.zip>` — apply a Theme Builder export, and
  find out at apply time if it's incomplete.
- [Theming](https://uiorganized.com/docs/theming) — the three ways to re-skin the
  system, and what a complete theme has to define.

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
