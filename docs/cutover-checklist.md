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
- [ ] **Analytics (optional — currently off).** There is no `VITE_CF_ANALYTICS_TOKEN`
      configured today, so analytics is disabled and the migration keeps it that way — **no
      action needed**. To turn it on later, add `VITE_CF_ANALYTICS_TOKEN` as a repository
      **Variable** (not a secret) with the value from Cloudflare dashboard → Web Analytics →
      your site → JS snippet (the `token` in `data-cf-beacon`). It must be a *variable*
      because the production bundle is built by the untrusted CI job, which never sees
      secrets — and the token is public in the client bundle anyway.
- [ ] If the contact form is in use, ensure the variables **`VITE_CONTACT_ENDPOINT`** and
      **`VITE_TURNSTILE_SITE_KEY`** are set (unset → the form is stubbed and Turnstile is
      hidden — a safe default, and what fork-PR previews always get).

## 3. Create the two Workers (first deploy)

The first deploy **creates** each Worker. `wrangler versions upload` (PR previews) only
works once the production Worker exists, so do this before relying on previews.

**Option A — let CI create them (simplest):**
- [ ] Merge the PR to `main`. `ci.yml` builds + tests, then `ci-report.yml` runs
      `wrangler deploy` → creates and deploys **`uiorganized`** (production).
- [ ] Actions tab → **Deploy staging** → *Run workflow* → creates and deploys
      **`uiorganized-staging`**.

**Option B — first deploy locally (more control), from the branch:**

> Requires **Node 22+** (wrangler's minimum) — e.g. `nvm use 22`.

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

`uiorganized.com`'s DNS is **already on Cloudflare** (nameservers `*.ns.cloudflare.com`) —
Squarespace is only the **registrar**, so there's no domain migration to do. The apex and
`www` currently have **proxied records pointing at the live Squarespace site**, and there
is **no apex `MX` record** (so email isn't affected — verify if you use `@uiorganized.com`
mail). A Worker Custom Domain can't attach while those records exist, which is the
"already has externally managed DNS records" error. Do it in two steps.

**4a. Validate on a subdomain first (zero risk to the live site):**
- [ ] Workers & Pages → **`uiorganized-staging`** → Settings → Domains & Routes → **Add** →
      *Custom domain* → **`staging.uiorganized.com`** (no existing record → no conflict).
- [ ] Confirm the staging site loads and behaves before touching the apex.

**4b. Cut the apex over (when ready — this replaces the Squarespace site):**
- [ ] DNS → Records: **record the current `uiorganized.com` apex and `www` values first**
      (screenshot — that's your rollback), then **delete** those records. ⚠️ This takes the
      Squarespace site offline at those hostnames.
- [ ] Workers & Pages → **`uiorganized`** → Domains & Routes → **Add** → *Custom domain* →
      `uiorganized.com` (then again for `www.uiorganized.com`). Cloudflare recreates the
      records pointing at the Worker.
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

- [ ] Keep the noted apex/`www` record values (from step 4b) until production on Workers
      is verified for a day or two.
- [ ] **To roll back:** delete the Worker custom domain and re-create the apex/`www` DNS
      records with their original Squarespace values. (Optionally also `git revert` the
      migration merge.)

---

### Reference
- Architecture, environment map, and trust model: [deployment.md](deployment.md).
- Contributor-facing CI behavior: [../CONTRIBUTING.md](../CONTRIBUTING.md).
