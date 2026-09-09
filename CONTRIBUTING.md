# Contributing

Thanks for contributing to UI Organized! This repo is a pnpm + Turborepo monorepo.

## Local development

```bash
pnpm install
pnpm dev        # run the apps
pnpm test       # unit tests (turbo test)
pnpm quality    # every automated gate — this is what CI runs
pnpm lint
pnpm typecheck
```

Node `>=20` and pnpm `>=9` (the version is pinned via `packageManager` in
`package.json`).

## Continuous integration

Every push and pull request runs **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)),
which runs five automated gates over the component library, then builds the site. CI must be
green for a PR to merge — it also gates every deploy.

| Gate                  | What it checks                                                                                  | Command                    | Blocks merge? |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------------------------- | ------------- |
| **Visual regression** | A screenshot of every story, diffed against a committed baseline                                | `pnpm quality:visual`      | No — reports  |
| **Interaction**       | The keyboard contract on every component, plus behaviour specs, on Chromium/Firefox/WebKit      | `pnpm quality:interaction` | **Yes**       |
| **Accessibility**     | axe-core over every story (all of them on Chromium, each component's canonical story elsewhere) | `pnpm quality:a11y`        | **Yes**       |
| **Tokens & lint**     | ESLint, Stylelint, the derived token contract, typecheck; Prettier reports                      | `pnpm quality:lint`        | **Yes**       |
| **Cross-browser**     | Every story renders on Firefox and WebKit with no console errors                                | `pnpm quality:browsers`    | No — reports  |

`pnpm quality` runs all of them and writes `manifest/test-status.json`, which the docs site
reads: every component page has a **Quality** section, and
[Foundations → Quality](https://uiorganized.com/docs/foundations/quality) lists the whole
library. CI regenerates that file _before_ building the marketing app, so a
deployed page always shows the results of the run that built it.

Visual regression and cross-browser are advisory on purpose. A pixel diff is usually an
intended redesign, and a gate that cries wolf on every restyle is one people learn to
force-merge past. They still report, and the result still shows on the docs page.

### Visual baselines

Baselines live in `apps/storybook/visual/__screenshots__/` and are **per-platform**. CI
renders inside the pinned Playwright container, so its baselines are `-linux`; a local macOS
run produces `-darwin`. To regenerate after an intended design change:

```bash
# locally (macOS baselines)
pnpm --filter @ui-organized/storybook run test:visual:update

# the same container CI uses (Linux baselines) — needs Docker
pnpm --filter @ui-organized/storybook run test:visual:docker -- --update-snapshots
```

Without Docker, run **Actions → CI → Run workflow** with _update-visual-baselines_ checked
and commit the `visual-baselines` artifact it uploads.

### Accessibility debt

`apps/storybook/a11y/known-violations.json` records the accessibility violations that exist
today, so the gate can block **new** ones while the backlog is worked down. Entries there are
open bugs, not accepted exceptions — the file should only ever shrink. Regenerate it with
`node scripts/quality/a11y-baseline.mjs` **to record a fix**, never to turn a red build
green. Genuinely accepted exceptions live in `ACCEPTED` in
[`apps/storybook/a11y/axe.spec.ts`](apps/storybook/a11y/axe.spec.ts), each with its reason.

### Preview deployments

After CI passes on a PR, a **maintainer-side** workflow
([`ci-report.yml`](.github/workflows/ci-report.yml)) deploys a Cloudflare preview and
posts (or updates) a sticky comment on your PR with the preview URL — links to the
marketing site, the builder, and Storybook. The preview appears **shortly after** CI
finishes, not during CI, because it runs in a separate trusted workflow.

### Fork PRs — what to expect

For security, pull requests **from forks** run CI with read-only permissions and **no
repository secrets or variables**. That's expected and safe; it only means your preview
builds in a slightly reduced mode:

- **Analytics** is off (no `VITE_CF_ANALYTICS_TOKEN`).
- The **contact form** is stubbed and **Turnstile** is hidden (no
  `VITE_CONTACT_ENDPOINT` / `VITE_TURNSTILE_SITE_KEY`).

Everything else — the full UI, the builder, Storybook — works normally in the preview.
Branch PRs from maintainers (same-repo) build with those values present.

The repo never runs untrusted PR code in a privileged, credentialed context (it avoids
the dangerous fork-PR trigger that would do so).

## Deployments

Merges to `main` deploy to production (`uiorganized.com`); staging
(`staging.uiorganized.com`) is deployed manually. See
[`docs/deployment.md`](docs/deployment.md) for the full environment map and trust model.

## Releases

Package releases go through [Changesets](https://github.com/changesets/changesets). If
your change affects a published package, add a changeset:

```bash
pnpm changeset
```

After a release is published, refresh the release dates the docs site reads.
Publishing pushes one git tag per package, and those tags are the only record of
_when_ a release happened — Changesets writes no dates into `CHANGELOG.md`. CI
checks out shallow, so the dates are committed rather than read at build time:

```bash
git pull --tags
pnpm generate:release-dates   # → manifest/release-dates.json
```

Skipping it isn't fatal: the new release simply appears on
[the changelog page](https://uiorganized.com/docs/foundations/changelog) without a
date until someone runs it.

## Roadmap

- **Test coverage reporting** — `@vitest/coverage-v8` is not installed yet, so `/coverage`
  on the site is still a placeholder.
- **A repo-wide Prettier pass** — the repo has a `.prettierrc` it has never been formatted
  against (~530 files). Until that lands as its own commit, the lint gate reports formatting
  on changed files rather than blocking on it.
- **Interaction specs for the remaining components** — every component is covered by the
  generic keyboard contract; the hand-written behaviour specs in
  `apps/storybook/interaction/` cover the components with real state machines so far.
