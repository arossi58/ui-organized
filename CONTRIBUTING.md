# Contributing

Thanks for contributing to UI Organized! This repo is a pnpm + Turborepo monorepo.

## Local development

```bash
pnpm install
pnpm dev        # run the apps
pnpm test       # run the full test suite (turbo test)
pnpm lint
pnpm typecheck
```

Node `>=20` and pnpm `>=9` (the version is pinned via `packageManager` in
`package.json`).

## Continuous integration

Every push and pull request runs **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)),
which builds the site and runs `pnpm test`. CI must be green for a PR to merge — it also
gates every deploy.

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

## Roadmap

Coming soon: **visual regression** in CI. Today there is a Playwright visual-regression
harness in `apps/storybook` (`pnpm --filter @ui-organized/storybook test:visual`) that is
not yet wired into CI.
