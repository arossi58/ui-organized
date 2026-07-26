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
| **Token coverage** | A theme that doesn't define everything the components read. Diffed against `token-contract.json`, which ships with your installed `@ui-organized/react` and is generated from its CSS — so it can't drift. **Blocks by default.** |
| **Fonts named but not loadable** | `theme.css` copied, `fonts.ts` left behind. The head keeps loading the *previous* theme's typefaces, the new metrics apply over them, and it looks deliberate. |
| **Weights that don't exist** | A family that doesn't ship a weight the theme asks for. Google answers `200` and quietly omits the face, so only reading the returned `@font-face` rules reveals it — the browser then synthesises the weight, heavier and looser than a real cut. |
| **Cascade conflicts** | A `--type-font-*` declaration in your own CSS that will silently beat the theme. Loading the font doesn't fix this, and the symptom points at the wrong file. |

It also repairs an `icons.ts` from an older Theme Builder on the way in — those
opened with an unused `import { IconProvider }`, which is a hard error under
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
| `--force` | Apply despite blocking findings or uncommitted changes |
| `--offline` | Skip the Google Fonts weight verification |
| `--cwd <dir>` | Treat `<dir>` as the project root |

Exit code is non-zero when a check blocks, so it works in CI.

## What it won't assume

- **Where your files go.** `src/styles/theme.css` is one project's convention,
  not a standard. It looks for an existing `theme.css` first, falls back to a
  documented default, and takes `--out`.
- **That overwriting is safe.** With uncommitted changes it refuses rather than
  overwrite work you can't `git diff` back. `--force` overrides.
- **Your bundler or framework.** Import sites differ, and your document head
  isn't ours to edit — so it prints the lines and where they go.
- **npm.** It reads your lockfile and suggests pnpm, Yarn or Bun commands to match.
- **That `unzip` is on your PATH.** The zip reader is built on Node's `zlib`,
  so it works the same on Windows.

Running it twice is a no-op, not a duplication.

## License

Apache-2.0
