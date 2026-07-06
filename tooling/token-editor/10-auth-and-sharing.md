# 10 — Authentication & Sharing

> Goal: authentication for non-GitHub users and the full sharing model. "Share with
> others" is a spectrum of four tiers; only the last two need the backend. Build
> the cheap tiers first.

## Authentication

Two identity paths, unified into one account:

1. **GitHub** (for repo users) — the OAuth/device flow from `07-github.md`. The
   GitHub identity can also create a Supabase account row so grants work uniformly.
2. **Supabase Auth** (for non-GitHub users) — email/password, magic link, and
   social providers. `accounts.id` is `auth.users.id`.

Rules:
- Access tokens (GitHub) live in memory; for the hosted tier, sessions are
  httpOnly cookies issued by the OAuth-exchange function / Supabase.
- Never put credentials in `localStorage`, URLs, or serialized state.
- Minimum scopes only; GitHub tokens scoped to the single repo.

## The four sharing tiers

### Tier 1 — Repo collaborators (zero new infra)
- Anyone with repo access points their editor at the same repo: pull, edit,
  commit/PR, review, merge. GitHub is the collaboration backend; permissions are
  repo permissions; conflict resolution is the PR. **Default for teams.**

### Tier 2 — Published read-only view (zero new infra)
- Static export via GitHub Actions → Pages, or a URL that loads tokens from a
  public repo. "Here's our token system." No backend.

### Tier 3 — Non-GitHub collaborators (needs Supabase) — PRIMARY GOAL
- A designer or stakeholder without a repo edits or views a project. Identity and
  access live in Supabase; the share grant is a row; RLS enforces viewer/editor/
  admin (see `09-backend.md`).
- Custom share semantics that GitHub can't express live here: share links with
  expiry, role assignment independent of GitHub, invite-by-email for not-yet-
  registered users.

### Tier 4 — Realtime co-editing (defer; seam already built)
- Live cursors / simultaneous edits. The Yjs working document already makes this a
  drop-in: add a network provider (Liveblocks / PartyKit / self-hosted Hocuspocus)
  without rearchitecting. **Do not build in v1.** Tokens change infrequently and
  deliberately; async-with-merge suffices.

## Sharing UX (Tier 3)

- "Share" dialog on a project: invite by email (creates a pending grant + invite),
  or generate a share link (hashed token grant with optional expiry), choosing a
  role.
- Pending invites resolve to a real grant when the invitee registers.
- Share links are validated by an edge function that checks the hashed token and
  issues a scoped session; never trust the raw link in a policy.
- Show current collaborators and their roles; owner/admin can revoke.

## Roles

| Role | Read | Edit tokens | Publish/PR | Manage grants |
|---|---|---|---|---|
| viewer | ✓ | | | |
| editor | ✓ | ✓ | (repo: via PR) | |
| admin | ✓ | ✓ | ✓ | ✓ |

- For repo-storage projects, "publish" still means opening a PR; editor role in
  the app does not bypass GitHub branch protections.

## Canonical-source rule (enforce)

- Repo-storage project: Supabase holds the grant and the `repo_ref`; the document
  is read/written through GitHub. The app must refuse to also write the document
  into Supabase for repo projects.
- Supabase-storage project: the document lives in `projects.document`; there is no
  repo to reconcile against.

## Definition of done

- Tier 1 and Tier 2 work with no Supabase project provisioned at all.
- Tier 3: invite-by-email and share-link both produce working, RLS-enforced
  access; a viewer cannot write; a revoked grant immediately loses access.
- Switching a project's `storage_kind` is a deliberate, guarded operation (it
  changes where truth lives) — surfaced, never implicit.

## Escalation triggers

- Granting access, changing roles, and creating share links are permissioned
  actions — always explicit, never inferred.
- If a share-link design would put a raw secret in a URL, stop and use the hashed-
  token + edge-function validation pattern instead.
