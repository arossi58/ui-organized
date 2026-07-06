# 15 — Legal & Compliance

> ⚠️ **NOT LEGAL ADVICE. REQUIRES LAWYER REVIEW BEFORE THE HOSTED TIER LAUNCHES.**
> This document organizes the obligations and turns them into implementation tasks
> so engineering can build the right capabilities. The user-facing legal documents
> (privacy policy, terms, DPAs) and the question of *which laws bind you* depend on
> your and your users' locations and must be reviewed by a qualified lawyer or a
> reputable generator a lawyer has checked. A template that misstates what you
> actually do is worse than none.

## Scope: who is responsible for what

The obligations attach when **you operate the hosted service**, not to the code you
ship. Pin this down in the data model and the docs:

| Path | Personal data held by | Legal responsibility |
|---|---|---|
| Self-host (adopter runs Supabase) | the adopter | the adopter is the controller; you provide software "as is" |
| Hosted uiorganized.com | **you** | you are the **data controller** |
| Repo-storage user (hosted) | you hold identity + grants; repo holds tokens | you control account data; GitHub controls repo data |

> Headline: operating the hosted tier makes you a **data controller**. The
> self-hosted build keeps that responsibility with whoever runs it. Most of this
> document is about uiorganized.com the service.

## Data inventory (maintain this — most obligations reference it)

| Data | Where | Purpose | Personal data? | Retention |
|---|---|---|---|---|
| account email | `auth.users` | login, account recovery | yes (PII) | life of account |
| auth identifiers / session | Supabase Auth | authentication | yes | session / account life |
| OAuth access token (GitHub) | memory / httpOnly cookie | act on the user's repo | yes — sensitive | until logout/disconnect |
| share grants (grantee, role) | `share_grants` | enforce sharing | yes (links people) | until revoked / project deleted |
| IP address | edge/function + DB logs | security, abuse prevention | yes | short log-retention window |
| token documents | `projects.document` / repo | the user's design tokens | generally **no** (user IP) | until project deleted |
| audit log entries | audit table | security forensics | yes (actor ids) | defined retention |

- **Minimize.** Data you don't collect can't be breached, subpoenaed, or
  mishandled. Do not add fields "just in case." Your minimization instinct is the
  single strongest legal control you have.

## Applicable laws (confirm scope with a lawyer)

- **GDPR / UK GDPR** — reaches anyone offering a service to people in the EU/UK
  regardless of where you are based. The strict regime: lawful basis for each
  processing purpose, data-subject rights (access, deletion, portability,
  rectification, objection), valid (opt-in) consent for non-essential processing,
  breach notification within 72 hours, and possibly an **EU/UK representative** if
  you process EU/UK data with no establishment there. Build to GDPR and you cover
  most of the rest.
- **CCPA / CPRA (California)** — the main US analog above certain thresholds;
  centered on disclosure and an opt-out of "selling/sharing" personal data.
- **Other US state laws** (e.g. Virginia, Colorado, and a growing list) broadly
  track CCPA; a GDPR-grade baseline generally satisfies them.
- **COPPA** (US, children under 13) and EU age-of-consent rules — see Children's
  Data below.
- Determining exactly which bind you is a **lawyer question**, driven by where you
  and your users are. Do not guess.

## User-facing documents required before the hosted tier accepts a real user

- **Privacy policy** — states accurately what you collect, why, the legal basis,
  who you share it with (subprocessors), retention, and how users exercise rights.
  Must reflect what you *actually do*; accuracy over polish.
- **Terms of Service** — acceptable use, disclaimers, limitation of liability,
  termination, governing law.
- **Cookie / consent mechanism** — if you use any non-essential cookies or
  analytics, GDPR requires **opt-in before** they load, not a passive banner.
- **Subprocessor list** — every third party that touches user data (see below),
  named in the privacy policy.
- **`SECURITY.md`** — already specced in `14`; cross-link from the privacy policy
  as the vulnerability-reporting channel.

## Capabilities to BUILD (a promise without the button is a liability)

Engineering tasks — do not ship the privacy policy claiming these until they exist:

1. **Account deletion that genuinely purges.** Delete the account and cascade
   through `share_grants`, `versions`, and **Storage blobs**; revoke/delete stored
   OAuth tokens. The `on delete cascade` in `09-backend.md` covers the DB rows;
   add explicit Storage-object deletion and token revocation. Verify nothing
   orphans.
2. **Data export / portability.** Let a user export their account data and their
   token documents in a portable format (DTCG export already exists for tokens;
   add an account-data export).
3. **Access-request handling.** A defined process (even if partly manual at first)
   to produce everything you hold about a person on request.
4. **Consent capture + record.** If non-essential cookies/analytics are used,
   capture opt-in and store the consent record (what, when, version).
5. **Data-subject request intake.** A monitored channel/route for deletion,
   access, and correction requests, with a tracked response clock.

> Assets you already have: **RLS** is a demonstrable access control, and the
> **audit log** (`14`) is your breach-investigation and access-request evidence.

## Consent & cookies

- Essential cookies (session/auth) need no consent; everything else (analytics,
  non-essential) requires prior opt-in under GDPR.
- Default to **no analytics** until consent, or use a privacy-preserving,
  cookieless analytics approach and confirm its consent posture with your lawyer.

## Subprocessors & data-processing agreements

- Maintain the live list: **Supabase** (DB/auth/storage), **Sentry** (errors),
  your **uptime/analytics** provider, the **OAuth-exchange host** (e.g. Cloudflare/
  Vercel/Netlify), and email/transactional providers.
- Under GDPR you must have a **DPA with every processor**. These vendors publish
  standard DPAs — accept each and keep copies.
- Configure error tracking and logs to **scrub PII/secrets** before they leave your
  systems (already required in `14`), which also shrinks what these subprocessors
  receive.

## Breach notification (wire into the `14` incident runbook)

Add an explicit **legal-notification branch** to the incident runbook:
- **Decision owner** named in advance — who determines whether a breach is
  notifiable.
- **72-hour clock** (GDPR) starts at awareness; the runbook must move fast enough to
  meet it. Pre-draft notification templates.
- **What is logged**: scope, data categories affected, number of people, timeline —
  sourced from the audit log + Sentry + Supabase logs.
- **Who is notified**: the relevant supervisory authority and, where required,
  affected users.
- This branch runs in parallel with technical containment, not after it.

## Children's data

- A developer tool should **state in its Terms that it is not directed to children
  and does not knowingly collect their data**, and not provide child-oriented
  features.
- If under-13 (US/COPPA) or under-16 (parts of EU) users could plausibly sign up,
  that triggers serious additional obligations — escalate to a lawyer rather than
  handling it ad hoc.

## OAuth tokens as sensitive data

- A stored GitHub token lets you act on someone's repositories — treat it as
  high-sensitivity: encrypted at rest if persisted, memory-only or httpOnly cookie
  by preference (see `07`/`14`), revoked on logout/disconnect, and purged on
  account deletion. Surface a clear "disconnect GitHub" control that revokes it.

## International data transfers

- If personal data moves between regions (e.g. EU users, US-hosted infra), GDPR
  transfer mechanisms (Standard Contractual Clauses, vendor data-residency options)
  may apply. Note your hosting regions and confirm the mechanism with your lawyer;
  Supabase offers region selection that can simplify this.

## Records & accountability (GDPR)

- Keep a lightweight **Record of Processing** (purposes, categories, recipients,
  retention) — the data inventory table above is its backbone; keep it current.
- Re-review this document whenever you add a data field, a subprocessor, or a new
  region.

## Open-source licensing & contributor IP (separate track, mostly done)

- **Apache-2.0 + trademark**; ship `LICENSE` + `NOTICE` in every package.
- **`CONTRIBUTING.md`** stating contributions are inbound under Apache-2.0 (inbound
  = outbound) so contributor IP is unambiguous; decide whether to require a DCO
  sign-off or a CLA.
- **Dependency license hygiene**: no GPL/copyleft in the shipped surface (already a
  rule); add a CI license-check so a disallowed license fails the build.
- **Trademark usage policy** — since the mark is protected, publish how others may
  (and may not) use the UI Organized name/logo when redistributing or self-hosting.

## Pre-launch compliance checklist (GATES the hosted tier)

- [ ] Data inventory written and matches what the code actually stores.
- [ ] Privacy policy, Terms, cookie/consent — drafted and **lawyer-reviewed**.
- [ ] Subprocessor list published; DPA accepted with each.
- [ ] Account deletion (DB cascade + Storage + token revocation) implemented and
      tested end to end.
- [ ] Data export / portability implemented.
- [ ] Data-subject request intake channel live with a tracked response clock.
- [ ] Consent capture (if any non-essential cookies/analytics) implemented.
- [ ] Breach-notification branch added to the `14` incident runbook with a named
      decision owner and pre-drafted templates.
- [ ] OAuth "disconnect" control revokes and purges the token.
- [ ] `SECURITY.md`, `CONTRIBUTING.md`, license-check CI, trademark policy in place.
- [ ] Children's-data stance stated in Terms.
- [ ] EU representative / transfer mechanism resolved with lawyer (if in scope).

## Definition of done

- Every box in the pre-launch checklist is checked before uiorganized.com accepts a
  real user's data.
- Deletion and export are demonstrable on a test account: request → data produced /
  data fully purged, verified including Storage and tokens.
- The data inventory and subprocessor list are current and match production.

## Escalation triggers

- Do not launch the hosted tier, accept real user data, or publish a privacy
  policy/Terms **without lawyer review**. This is a hard gate, not a guideline.
- Adding any new data field, subprocessor, hosting region, or analytics tool
  requires updating this document and re-checking obligations before it ships.
- Any sign an under-age user could register, or any cross-border transfer question,
  goes to a lawyer rather than being resolved in code.
