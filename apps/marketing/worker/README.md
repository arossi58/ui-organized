# Contact-form Worker

Cloudflare Worker that backs the marketing site's contact form. The site is
static (GitHub Pages), so it can't hold secrets — the form POSTs here instead.

**On every submission:** validate → verify Turnstile → email the owner (Resend).
**For "I have a suggestion":** also add a draft item to the GitHub Project's
**Ideas** column.

It is deployed **independently** of the site (not a pnpm workspace member, so it
doesn't touch the monorepo lockfile or the GitHub Pages build).

---

## One-time setup

### 1. Install + log in

```bash
cd apps/marketing/worker
npm install            # or: pnpm install --ignore-workspace
npx wrangler login
```

### 2. Resend (email)

1. Create a [Resend](https://resend.com) account and **verify the domain
   `uiorganized.com`** (add the DKIM/SPF DNS records it gives you).
2. Create an API key.
3. `CONTACT_FROM` in `wrangler.toml` must use that verified domain
   (default `contact@uiorganized.com`). `CONTACT_TO` is where mail lands.

### 3. GitHub token (suggestion → Ideas)

Create a **fine-grained PAT** with **read & write** access to **Projects** for
the account that owns the board (`arossi58`, project `#2`). Draft items live in
the project itself, so no repository scope is needed.

> The Status option is matched by name (`IDEAS_STATUS_NAME`, default `Ideas`).
> If you rename the column, update that var.

### 4. Turnstile (optional but recommended)

Get the **secret** key (not the site key) from the Cloudflare Turnstile
dashboard for the same widget the site already uses. When set, tokens are
verified server-side; unset, the Worker skips that check.

### 5. Set the secrets

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put PROJECT_TOKEN
npx wrangler secret put TURNSTILE_SECRET_KEY   # optional
```

(Non-secret config lives in `wrangler.toml` under `[vars]`.)

### 6. Deploy

```bash
npx wrangler deploy
```

Wrangler prints the URL (e.g. `https://ui-organized-contact.<subdomain>.workers.dev`,
or your custom domain if you uncomment `routes` in `wrangler.toml`).

### 7. Point the site at it

Set the build env var so the form knows where to POST:

- **Local:** add `VITE_CONTACT_ENDPOINT=<worker url>` to `apps/marketing/.env.local`.
- **Production:** add `VITE_CONTACT_ENDPOINT` as a GitHub repo
  **variable** (Settings → Secrets and variables → Actions → Variables) — it's a
  public URL, not a secret. `deploy.yml` already passes it (and
  `VITE_TURNSTILE_SITE_KEY`) into the marketing build.

Make sure the site's origin is in `ALLOWED_ORIGINS` (it already includes the
apex, `www`, and `localhost:5173`).

---

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in your keys
npm run dev                      # wrangler dev, serves on http://localhost:8787
```

Then run the marketing site with `VITE_CONTACT_ENDPOINT=http://localhost:8787`.

## Request contract

`POST` JSON matching `ContactPayload` from
`apps/marketing/src/lib/contact.ts`:

```jsonc
{
  "inquiryType": "suggestion" | "contribution",
  "name": "string",
  "email": "string",
  "message": "string",
  "captchaToken": "string | null"
}
```

Responses: `200 {"ok":true}` on success; `4xx/5xx {"error":"…"}` otherwise.
