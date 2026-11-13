# @ui-organized/cli

Apply a [UI Organized](https://uiorganized.com) theme bundle to a project — and
check it actually works.

```sh
npx @ui-organized/cli theme ~/Downloads/my-theme.zip
```

No install step, and no dependencies to download first.

## What it's for

Copying four files out of a zip is `unzip && cp`; that doesn't need a tool. What
needs a tool is **validating at the moment you apply**, which only the design
system can do, because it's the only thing that knows its own contract.

Every one of these used to be silent — the build stayed green and the app looked
plausible while rendering the wrong thing:

| Check | What it catches |
| --- | --- |
| **Token coverage** | A theme that doesn't define everything the components read. Diffed against `token-contract.json`, which ships with `@ui-organized/core` and is generated from the component CSS. It's read through the library you have installed (React, Svelte, Vue or Angular), so it matches your version and can't drift. **Blocks by default.** |
| **Fonts named but not loadable** | `theme.css` copied, `fonts.ts` left behind. The head keeps loading the *previous* theme's typefaces, the new metrics apply over them, and it looks deliberate. |
| **Weights that don't exist** | A family that doesn't ship a weight the theme asks for. Google answers `200` and quietly omits the face, so only reading the returned `@font-face` rules reveals it — the browser then synthesises the weight, heavier and looser than a real cut. |
| **Cascade conflicts** | A `--type-font-*` declaration in your own CSS that will silently beat the theme. Loading the font doesn't fix this, and the symptom points at the wrong file. |

When it's done it prints the rest of the setup for your library: the stylesheet
imports in order (or, in an Angular CLI project, the `angular.json` `"styles"`
list), the icon set to install and register, the icon provider with your theme's
settings, and the font links for your document head.

`icons.ts` is React's `IconProvider` config, so it's only written in a React
project; Svelte, Vue and Angular get their own provider printed instead. It also
repairs an `icons.ts` from an older Theme Builder on the way in — those opened
with an unused `import { IconProvider }`, which is a hard error under
`noUnusedLocals` (the Vite React template's default).

## Usage

```sh
uiorg theme <bundle>          # a .zip, or a folder you already unzipped
uiorg theme <bundle> --check  # report only, write nothing
```

| Option | |
| --- | --- |
| `--out <dir>` | Where to write. Default: beside an existing `theme.css`, else `src/styles/` |
| `--dry-run` | Alias for `--check` |
| `--force` | Apply despite blocking findings or uncommitted changes. The exit code is still 1 when a check blocked |
| `--offline` | Skip the Google Fonts weight verification |
| `--cwd <dir>` | Treat `<dir>` as the project root. At a monorepo root, point it at the app |
| `--framework <f>` | `react`, `svelte`, `vue` or `angular`, when package.json lists none or several |

Exit code is non-zero when a check blocks, so it works in CI. A finding marked
`✓` is a check that ran and passed; `!` is a warning, including a check that
couldn't run; `·` is context.

## Set up AI agents

```sh
npx @ui-organized/cli init
```

In a project using a UI Organized library — React, Svelte, Vue or Angular — this
detects which one and adds that library's rules to
`AGENTS.md` and `CLAUDE.md` and registers
[`@ui-organized/mcp`](https://github.com/arossi58/ui-organized/tree/main/packages/mcp)
in `.mcp.json`. It also sets up Cursor if there's a `.cursor/` directory, or if you
pass `--cursor`. Re-running updates its own section of `AGENTS.md` and
`CLAUDE.md` and its own entry in `.mcp.json`, keeping your other content and any
fields you added to that entry, such as `env`. The skill and the Cursor rules are
files it owns, so it replaces those. `--check` reports without writing.

The MCP server is pinned to the library version you have installed, since the two
release together, and set to answer for that library. Re-run init after upgrading
to move the pin. On 6.0.x it pins `@ui-organized/mcp@0.1.0`, which carries 6.0.0's
data: the server's own 6.0.0 was never published. In a monorepo, run it at the root: it reads the workspace packages
in `pnpm-workspace.yaml` or package.json `workspaces`, and writes the files at the
root, where your agent starts. It also installs a
`ui-organized-figma` skill (`.claude/skills/`, and a Cursor rule when Cursor is set
up) for building from a Figma link with Figma's own MCP server. A project with more than one
UI Organized library installed chooses with `--framework react|svelte|vue|angular`.

## What it won't assume

- **Where your files go.** `src/styles/theme.css` is one project's convention,
  not a standard. It looks for an existing `theme.css` first, falls back to a
  documented default, and takes `--out`.
- **That overwriting is safe.** With uncommitted changes it refuses rather than
  overwrite work you can't `git diff` back. `--force` overrides.
- **Your bundler or framework.** Import sites differ, and your document head
  isn't ours to edit — so it prints the lines for your library and where they go.
- **npm.** It reads your lockfile and suggests pnpm, Yarn or Bun commands to match.
- **That `unzip` is on your PATH.** The zip reader is built on Node's `zlib`,
  so it works the same on Windows.

Running it twice is a no-op, not a duplication.

## License

Apache-2.0
