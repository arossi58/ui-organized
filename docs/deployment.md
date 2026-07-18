# Deployment

The site is hosted on **Cloudflare Workers** (static assets), replacing the previous
GitHub Pages setup. One assembled directory (`_site/`) is served, containing three apps
plus two placeholder paths.

## What gets deployed

`scripts/assemble-site.mjs` builds `_site/` from the app outputs:

| Path          | Content                                             |
| ------------- | --------------------------------------------------- |
| `/`           | Marketing site (`apps/marketing`, BrowserRouter SPA)|
| `/builder/`   | Theme builder (`apps/builder`)                      |
| `/storybook/` | White-labeled Storybook (`apps/storybook`)          |
| `/404.html`   | Copy of the marketing shell (SPA fallback)          |
| `/coverage/`  | Placeholder — real coverage report is a follow-up   |
| `/quality/`   | Placeholder — real quality dashboard is a follow-up |

`not_found_handling: "404-page"` serves `404.html` (the marketing shell) for unmatched
routes, so client-side routing resolves exactly as it did on GitHub Pages.

## Environments

| Environment    | URL                        | Worker               | Trigger                                        |
| -------------- | -------------------------- | -------------------- | ---------------------------------------------- |
| **Production** | `uiorganized.com`          | `uiorganized`        | Push (or dispatch) to `main`, after CI passes  |
| **Staging**    | `staging.uiorganized.com`  | `uiorganized-staging`| Manual (`Deploy staging` workflow)             |
| **Preview**    | per-PR `*.workers.dev` URL | `uiorganized` version| Every PR (incl. forks), after CI passes        |

Config lives in [`wrangler.jsonc`](../wrangler.jsonc) (`env.staging` redeclares `assets`
because named environments do not inherit it).

## How it works (CI trust boundary)

This is an open-source repo that accepts fork PRs. Fork PRs never receive repository
secrets, so untrusted code must never run in a job that holds the Cloudflare token. The
work is split across two workflows:

- **[`ci.yml`](../.github/workflows/ci.yml) — untrusted.** Runs on every push and PR.
  Read-only permissions, references no secrets. Builds + assembles the site, runs
  `pnpm test`, and uploads `_site` as the `site` artifact. It never deploys.
- **[`ci-report.yml`](../.github/workflows/ci-report.yml) — trusted.** Runs on
  `workflow_run` after CI completes, from the base branch, with write permissions and the
  Cloudflare credentials. It downloads CI's artifact as inert data (it never runs fork
  code) and:
  - **PR** → `wrangler versions upload` (a preview version; does not shift production
    traffic) and posts/updates a sticky PR comment with the preview URL.
  - **push/dispatch on `main`** → `wrangler deploy` (production), consuming the same
    already-tested artifact.

The dangerous fork-PR trigger that would run untrusted code with a writable token is
deliberately not used anywhere.

`roadmap-sync.yml` commits `roadmap.json` and then dispatches `ci.yml` (a `GITHUB_TOKEN`
commit can't trigger workflows on its own), which flows through to a production deploy.

Staging is separate: **[`deploy-staging.yml`](../.github/workflows/deploy-staging.yml)**
is `workflow_dispatch`-only and builds the site itself (a manual run has no upstream CI
artifact to consume). Run it from the Actions tab or with `gh workflow run
deploy-staging.yml` (optionally `-f ref=<branch|tag|sha>`).

## Secrets & variables (provisioned by a maintainer)

Set under **Settings → Secrets and variables → Actions**.

| Name                     | Kind     | Used by                          | Notes                                            |
| ------------------------ | -------- | -------------------------------- | ------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`   | secret   | `ci-report.yml`, `deploy-staging`| Workers deploy permission                        |
| `CLOUDFLARE_ACCOUNT_ID`  | secret   | `ci-report.yml`, `deploy-staging`| Cloudflare account id                            |
| `VITE_CF_ANALYTICS_TOKEN`| variable | `ci.yml` (build)                 | Optional; analytics off unless set (public → variable) |
| `VITE_CONTACT_ENDPOINT`  | variable | `ci.yml` (build)                 | Contact-form Worker URL                          |
| `VITE_TURNSTILE_SITE_KEY`| variable | `ci.yml` (build)                 | Turnstile site key                               |

Analytics is currently **disabled** — no `VITE_CF_ANALYTICS_TOKEN` is configured, and the
migration keeps it off with no action required. To enable Cloudflare Web Analytics, add
`VITE_CF_ANALYTICS_TOKEN` as a repository **variable** (not a secret — it's public in the
client bundle) so the CI build embeds it into the production bundle. Leave it unset to keep
analytics off. Fork-PR previews never receive variables, so they always build with
analytics off regardless.

`ROADMAP_TOKEN` (roadmap sync) and `NPM_TOKEN` (release) are unchanged.

## Deploy locally (validation only — do not run real deploys casually)

```bash
# Build the apps + assemble _site/ (what CI does):
pnpm turbo build --filter=@ui-organized/marketing^... --filter=@ui-organized/builder^... --filter=@ui-organized/storybook^...
pnpm --filter @ui-organized/marketing exec vite build         # BASE_PATH=/ by default
BASE_PATH=/builder/ pnpm --filter @ui-organized/builder exec vite build
pnpm --filter @ui-organized/storybook exec storybook build
node scripts/assemble-site.mjs

# Validate the Worker config without deploying:
pnpm exec wrangler deploy --dry-run

# Real deploys (require CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID in env):
pnpm exec wrangler deploy                # production
pnpm exec wrangler deploy --env staging  # staging
```

## One-time cutover (maintainer)

1. Create the `uiorganized` and `uiorganized-staging` Workers (a first `wrangler deploy`
   from a maintainer machine, or let CI create them once secrets exist).
2. Provision the secrets/variables above (re-create `VITE_CF_ANALYTICS_TOKEN` as a
   variable).
3. Attach custom domains **`uiorganized.com`** (production) and
   **`staging.uiorganized.com`** (staging) to the Workers — Cloudflare dashboard → the
   Worker → *Custom Domains* — and move DNS off GitHub Pages.
4. In **Settings → Pages**, disable the GitHub Pages site and delete the `github-pages`
   environment.
5. Confirm `pnpm test` is green on `main` — it now gates every deploy.

## Deferred follow-ups

- Coverage tooling (`@vitest/coverage-v8`) → real `/coverage`.
- Vitest JUnit reporter → uploaded test XML.
- Real `/quality` data (token-contrast, a11y pass-rate, coverage summary).
- Visual regression in CI (reg-actions, or wiring the existing `apps/storybook`
  Playwright harness).
