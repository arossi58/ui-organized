# Cutover checklist — GitHub Pages → Cloudflare Workers

Everything in code is done and verified (config dry-runs clean, full test suite green).
What remains is operational: provisioning credentials, creating the Workers, attaching
domains, and cutting over DNS. Do the steps **in order** — several have dependencies
(e.g. previews only work after the production Worker exists).

> **Token safety:** never paste any API token, account ID, or beacon value into a file,
> commit, or chat. Enter them only in the GitHub Settings UI and (for local deploys) your
> own shell environment.

---

## 0. Land the code

- [ ] Review branch `migration/cloudflare-workers` and open a PR into `main`.
- [ ] Don't merge yet if you want the very first deploy to be controlled — but CI
      (`ci.yml`: build + test) will run on the PR and should pass. The preview deploy
      step won't work until step 2 (no Cloudflare secrets yet) — that's expected.

## 1. Cloudflare account setup

- [ ] **Account ID** — Cloudflare dashboard → Workers & Pages → right sidebar → copy
      *Account ID*.
- [ ] **workers.dev subdomain** (one-time) — Workers & Pages → if prompted, register a
      `*.workers.dev` subdomain. **Preview URLs depend on this**; without it
      `wrangler versions upload` has no URL to hand back.
- [ ] **API token** — My Profile → API Tokens → Create Token → use the
      **"Edit Cloudflare Workers"** template, scoped to your account. (Least-privilege
      alternative: a custom token with *Account → Workers Scripts → Edit* and
      *Account → Account Settings → Read*.) Copy the token once.

## 2. GitHub configuration

Repo → Settings → Secrets and variables → Actions.

- [ ] Add secret **`CLOUDFLARE_API_TOKEN`** (from step 1).
- [ ] Add secret **`CLOUDFLARE_ACCOUNT_ID`** (from step 1).
- [ ] **Reclassify the analytics token**: delete the existing **secret**
      `VITE_CF_ANALYTICS_TOKEN`, then re-create it as a **Variable** with the same value
      (Cloudflare dashboard → Web Analytics → your site → JS snippet → the `token` in
      `data-cf-beacon`). It must be a *variable* so the build embeds it into the
      production bundle. *(Why: the production artifact is built by the untrusted CI job,
      which never sees secrets. The token is already public in the client bundle, so this
      is safe.)*
- [ ] Confirm the existing variables **`VITE_CONTACT_ENDPOINT`** and
      **`VITE_TURNSTILE_SITE_KEY`** are still present.

## 3. Create the two Workers (first deploy)

The first deploy **creates** each Worker. `wrangler versions upload` (PR previews) only
works once the production Worker exists, so do this before relying on previews.

**Option A — let CI create them (simplest):**
- [ ] Merge the PR to `main`. `ci.yml` builds + tests, then `ci-report.yml` runs
      `wrangler deploy` → creates and deploys **`uiorganized`** (production).
- [ ] Actions tab → **Deploy staging** → *Run workflow* → creates and deploys
      **`uiorganized-staging`**.

**Option B — first deploy locally (more control), from the branch:**
```bash
export CLOUDFLARE_API_TOKEN=...      # your shell only — do not commit
export CLOUDFLARE_ACCOUNT_ID=...
pnpm install
pnpm turbo build --filter=@ui-organized/marketing^... --filter=@ui-organized/builder^... --filter=@ui-organized/storybook^...
pnpm --filter @ui-organized/marketing exec vite build
BASE_PATH=/builder/ pnpm --filter @ui-organized/builder exec vite build
pnpm --filter @ui-organized/storybook exec storybook build
node scripts/assemble-site.mjs
pnpm exec wrangler deploy                 # creates uiorganized (production)
pnpm exec wrangler deploy --env staging   # creates uiorganized-staging
```

- [ ] Smoke-test each Worker on its `*.workers.dev` URL (printed by the deploy):
      `/`, `/builder/`, `/storybook/`, and a hard refresh of a deep route (e.g. `/docs`)
      should resolve via the `404.html` shell.

## 4. Attach custom domains + DNS cutover

`uiorganized.com` currently points at GitHub Pages. Cloudflare custom domains manage the
DNS record for you, so this is where traffic actually moves.

- [ ] Workers & Pages → **`uiorganized`** → Settings → Domains & Routes → **Add** →
      *Custom domain* → `uiorganized.com` (and `www.uiorganized.com` if you serve www).
- [ ] Workers & Pages → **`uiorganized-staging`** → add custom domain
      `staging.uiorganized.com`.
- [ ] DNS (dashboard → your domain → DNS → Records): remove the **old GitHub Pages
      records** for the apex/www (the `A` records to GitHub's `185.199.108–111.153`, or a
      `CNAME` to `arossi58.github.io`). Cloudflare will have added the Worker route
      records; make sure nothing still points at Pages.
- [ ] Wait for the certificate to go active, then load `https://uiorganized.com`.

## 5. Decommission GitHub Pages

- [ ] Repo → Settings → **Pages** → set Source to **None** (disable the site).
- [ ] Repo → Settings → **Environments** → delete the **`github-pages`** environment.
      *(The `deploy.yml` workflow and `CNAME`/`.nojekyll` files are already removed in this
      branch.)*

## 6. Verify end-to-end

- [ ] **Production** `uiorganized.com`: marketing loads; `/builder/` and `/storybook/`
      load; a deep-route hard refresh resolves; DevTools → Network shows
      `static.cloudflareinsights.com/beacon.min.js` loading (analytics on); contact form
      submits (uses `VITE_CONTACT_ENDPOINT`).
- [ ] **Staging** `staging.uiorganized.com`: same checks.
- [ ] **Preview**: open a throwaway PR → after CI passes, `CI Report` posts a sticky
      comment with a `*.workers.dev` preview URL → all three apps load. (Fork PRs build
      with analytics off / contact stubbed — expected.)
- [ ] **Roadmap redeploy**: Actions → *Sync roadmap from GitHub Projects* → *Run workflow*
      (or edit an issue). If `roadmap.json` changed it dispatches `ci.yml`, which flows to
      a production redeploy.

## 7. Keep a rollback path until you're confident

- [ ] Don't delete anything at GitHub Pages / your DNS backup until production on Workers
      is verified for a day or two.
- [ ] **To roll back:** point `uiorganized.com` DNS back at GitHub Pages and
      `git revert` the migration merge (restores `deploy.yml` + `CNAME`), then re-enable
      Pages in Settings.

---

### Reference
- Architecture, environment map, and trust model: [deployment.md](deployment.md).
- Contributor-facing CI behavior: [../CONTRIBUTING.md](../CONTRIBUTING.md).
