# 14 — Security & Monitoring

> Goal: make the system secure by construction and give the operator a single,
> concrete way to see its health and any vulnerabilities. This document is the
> consolidated security reference — it gathers rules stated across `07`–`11` and
> `13` and adds the hardening, vulnerability-visibility, and observability layers.
> Security is **continuous across every phase**, not a single phase. It maps to the
> Phase 9 hardening pass in `12-build-sequence.md` plus ongoing CI gates.

## Threat model (what we protect, from whom)

- **Crown jewels**: OAuth access tokens, the GitHub OAuth client secret, the
  Supabase service-role key, and the npm publish token. Compromise of any of these
  is the worst case.
- **User assets**: token documents (the user's IP), account emails (PII), and
  share grants.
- **Adversaries we design against**: XSS/script injection in the editor; malicious
  *imported files* (untrusted DTCG / Tokens Studio input); supply-chain attacks via
  dependencies; misconfigured RLS leaking projects; CI/Actions secret exfiltration;
  share-link abuse.
- **Explicit non-goal**: we are not a multi-tenant SaaS storing high-value PII;
  keep it that way. Do not collect data we don't need.

## Data classification

| Class | Examples | Rule |
|---|---|---|
| Secret | OAuth tokens, client secret, service-role key, npm token | Never in client code, `localStorage`, URLs, logs, or the DB. Memory or server-side env only. |
| PII | account email | Minimize; store only in Supabase `auth.users`; never log. |
| User IP | token documents | User-owned; encrypted in transit; access gated by RLS / repo perms. |
| Public | published token sets, marketing site | No protection needed; assume world-readable. |

## Secrets & credential handling (consolidated rules)

- **GitHub access token**: memory-only in the client; for the hosted tier, an
  httpOnly, `Secure`, `SameSite` session cookie issued by the OAuth-exchange
  function. Never `localStorage`, never a URL/query string.
- **GitHub client secret**: lives ONLY in the OAuth-exchange function's env. PKCE
  does not remove this requirement for GitHub; device flow avoids it entirely on
  self-host. Never ship it in any client bundle.
- **Figma**: the plugin runs in the user's authenticated session — no stored Figma
  credentials at all. Keep it that way.
- **Supabase**: the **anon key** is the only key the client may hold (and it is
  safe only because RLS is enforced). The **service-role key** never touches the
  client or any public repo; it lives in edge-function / Actions env.
- **npm publish token**: Actions secret only; prefer OIDC + provenance (below) over
  a long-lived token where possible.
- **Token scopes**: always minimal. GitHub tokens scoped to the single target repo.
- **Rotation**: document a rotation procedure for every secret (see Incident
  Response). Rotation must be a known, rehearsed step, not an emergency scramble.

## Application security (editor + resolver + imports)

### Editor (browser)
- **Strict CSP**: no `unsafe-inline`/`unsafe-eval`; bundle assets, do not load app
  code from third-party CDNs at runtime. Set `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a restrictive
  `frame-ancestors`.
- **No `dangerouslySetInnerHTML`** with token-derived content. Token names,
  descriptions, and values are untrusted strings — render as text, never as HTML.
- **In-memory token never serialized** into any state that persists (Yjs doc,
  IndexedDB, URL). Keep it in a non-persisted module scope.

### Resolver (already specced — reaffirm)
- **No `eval`, no `Function`.** The math evaluator is a fixed-grammar parser. This
  is a security control, not just a style choice: imported documents are untrusted
  and flow through the evaluator.
- Cycle detection and typed misses prevent infinite loops and crashes on hostile
  input.

### Imported-file trust (untrusted input)
Imported DTCG / Tokens Studio files are **untrusted**. The import path must:
- **Validate with Zod** before anything else; reject malformed documents with a
  typed error.
- **Guard against prototype pollution**: reject or sanitize object keys
  `__proto__`, `constructor`, `prototype` during JSON parse/merge; use a
  null-prototype map or a safe parser. Never deep-merge attacker-controlled keys
  into a real object.
- **Enforce resource limits**: max file size, max token count, max nesting depth,
  max reference-chain length. Reject oversized/over-deep documents to prevent DoS.
- **No network fetches triggered by file content** (e.g. a `$value` that looks like
  a URL must never be auto-fetched).

## Backend security (Supabase + edge functions)

- **RLS on every table, always.** A failing query under RLS means the policy is
  wrong — never disable RLS to "make it work." Treat RLS policies as code: review
  them, test them (below).
- **RLS test coverage is mandatory**: for each table, automated tests assert that
  owner, viewer, editor, admin, and *unauthorized* users get exactly the access
  they should — including a test that a viewer's write is rejected at the database.
- **Service-role key** only in trusted server contexts; never expose an endpoint
  that proxies service-role access without its own authorization.
- **Auth hardening**: enable leaked-password protection, sensible session timeouts,
  email-confirmation, and rate-limited auth endpoints in Supabase Auth config.
- **Edge functions** (OAuth exchange, share-link validation): validate all input,
  rate-limit per IP/session, never log secrets or tokens, set strict CORS to the
  app origin only, and return generic errors (no internal detail leakage).
- **Share links**: hashed tokens with expiry, validated by an edge function,
  rate-limited against brute force; raw secrets never appear in a URL or a policy.

## Supply chain & dependencies

- **Lockfile committed**; CI runs `pnpm install --frozen-lockfile`.
- **`pnpm audit` gate** in CI; fail on high/critical (with a documented, time-boxed
  waiver process for false positives).
- **Automated dependency updates**: Dependabot or Renovate, with security updates
  auto-PR'd. Triage on the cadence in Vulnerability Management.
- **Install-script caution**: review/limit lifecycle scripts of new deps; prefer
  packages without postinstall scripts; pin where feasible.
- **Publish provenance**: publish `@ui-organized` packages from Actions with
  `npm publish --provenance` via OIDC, so consumers can verify the package was
  built from this repo. Sign releases.

## CI/CD & GitHub Actions security

- **Least-privilege `GITHUB_TOKEN`**: set `permissions:` explicitly per workflow to
  the minimum (often `contents: read`); elevate only the specific job that needs it.
- **Pin third-party actions to a full commit SHA**, not a moving tag.
- **Never use `pull_request_target` with untrusted checkout** of PR code; keep
  secret-bearing jobs off PRs from forks.
- **Secrets never echoed** to logs; enable GitHub **secret scanning** + push
  protection on the repo.
- The privileged pipeline (Style Dictionary build, Changesets, npm publish) runs in
  Actions with scoped secrets and is isolated from library CI (see `13`/repo
  structure): backend/publish secrets never load in unrelated jobs.

## Vulnerability management — how YOU see vulnerabilities

The single canonical place is the repo's **GitHub Security tab**, which aggregates:
- **Dependabot alerts** — vulnerable dependencies, with severity and fix PRs.
- **Code scanning (CodeQL)** — static analysis of the TS/JS for injection, unsafe
  patterns, etc. Run on every PR and on a schedule.
- **Secret scanning + push protection** — catches committed credentials before they
  merge.

Operational workflow:
- **Triage SLA by severity**: critical → patch within 48h; high → 1 week; medium →
  next release; low → backlog. Document and follow it.
- CI fails the build on new high/critical dependency or code-scanning findings, so
  vulnerabilities can't silently accumulate.
- A weekly automated digest of open security alerts (via the GitHub API) posts to
  the team channel so nothing sits unseen.

## Monitoring, health & observability — how YOU see health

### Error tracking
- **Sentry (or equivalent)** in the editor app and edge functions. Distinguish
  *expected* resolver misses (typed, normal) from *unexpected* exceptions (alert).
- Scrub PII/secrets from error payloads before sending.

### Uptime & status
- An external **uptime monitor / status page** for: the editor app, the
  OAuth-exchange function, and Supabase. Public or internal status page so outages
  are visible at a glance.

### Supabase observability
- Watch the Supabase dashboard logs for query performance, auth events, and
  **RLS-denied query spikes** (a denial spike can indicate probing/misconfig).

### Pipeline health
- GitHub Actions run status and the Changesets/publish history are the
  build-health signal; surface failed builds immediately.

### Operator health dashboard (build this — it's the "single pane" you asked for)
A small internal admin view that aggregates, via each provider's API, exactly the
two things you want to watch — **health** and **vulnerabilities** — in one place:

| Panel | Source |
|---|---|
| Open security alerts (count by severity) | GitHub Security / Dependabot / code-scanning API |
| Latest CI / release status | GitHub Actions API |
| App + edge-function error rate (24h) | Sentry API |
| Uptime / current status | uptime monitor API |
| DB health, auth events, RLS-denial rate | Supabase logs/metrics |
| Sync success rate, Figma-push outcomes, export-build success | app-emitted metrics |

Gate it behind admin auth (RLS/role check). This view is the answer to "I can view
the health of it or any vulnerabilities."

## Audit logging

Record security-relevant events with actor, target, timestamp, and result:
- grant created/revoked, role changed, share link created/used
- `storage_kind` switched, project ownership changed
- PR opened, library published, Figma variables written/deleted
Store in an append-only table (or a logging sink); never log secrets or token
values. Retain per your policy; expose recent entries in the operator dashboard.

## Alerting (thresholds → channel)

Page/notify on: error-rate spike, auth-failure spike, **RLS-denial spike**, failed
release/publish, a new **critical** dependency/code-scanning alert, uptime check
failure, and edge-function rate-limit saturation. Route to a single on-call
channel; tune thresholds to avoid noise.

## Incident response (runbook)

1. **Contain**: revoke/rotate the affected secret immediately (rotation steps are
   pre-documented per secret).
2. **Assess**: use audit log + Sentry + Supabase logs to scope impact.
3. **Rotate**: GitHub client secret, Supabase service-role key, npm token — each has
   a written rotation procedure; rehearse them.
4. **Notify**: if user data is implicated, follow the disclosure policy.
5. **Post-mortem**: blameless write-up; add a regression test/control.

## Responsible disclosure (`SECURITY.md` at repo root)

As an open-source project, ship a `SECURITY.md`:
- how to report a vulnerability (a monitored security contact, not a public issue)
- supported versions and expected response time
- safe-harbor language for good-faith researchers
Link it from the README and the security policy in the repo settings.

## Definition of done

- CSP and security headers set; no `eval`/`Function` anywhere; import path passes
  the prototype-pollution and resource-limit tests.
- RLS enabled on all tables with passing positive **and negative** access tests.
- `pnpm audit`, CodeQL, secret scanning, and Dependabot all active and gating CI.
- Provenance enabled on publish; Actions use least-privilege tokens and pinned
  SHAs.
- Sentry, an uptime monitor, and the operator health dashboard are live; alerts
  route to a channel.
- `SECURITY.md` exists and is linked.

## Escalation triggers

- Never disable RLS, ship a secret to the client, or merge past a failing security
  gate to "unblock" — stop and fix the underlying issue or get an explicit,
  recorded waiver.
- Any suspected exposure of a crown-jewel secret triggers the incident runbook
  immediately, not after investigation.
- If adding a dependency that needs install scripts or broad permissions, confirm
  before adding it.
