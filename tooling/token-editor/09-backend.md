# 09 — Backend (Supabase)

> Goal: the optional hosted backend for **non-GitHub collaborators and custom
> share semantics only**. Postgres + Auth + RLS + Storage. Self-hostable via Docker
> so adopters never depend on uiorganized.com. For repo users, the repo stays
> canonical — Supabase holds identity + grants, not a competing copy of tokens.

## When Supabase is the store vs. not

- **Repo users**: Supabase stores their account and any share grants. Their tokens
  live in their repo. Supabase may hold a pointer/cache, never the source of truth.
- **Non-GitHub users**: Supabase stores the project document itself (current doc in
  Postgres `jsonb`; version history as compressed blobs in Storage).

> Crossing this wire creates two competing sources of truth — the exact problem
> the ecosystem exists to avoid. Enforce it in the data model and the app.

## Schema

```sql
-- accounts: 1:1 with auth.users
create table accounts (
  id          uuid primary key references auth.users(id),
  handle      text unique,
  created_at  timestamptz default now()
);

-- projects
create table projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references accounts(id),
  name        text not null,
  -- storage_kind: where the canonical document lives
  storage_kind text not null check (storage_kind in ('repo','supabase')),
  repo_ref    jsonb,         -- {owner, name, branch, path} when storage_kind='repo'
  document    jsonb,         -- ProjectDocument when storage_kind='supabase'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- share grants: the heart of "sharing with others"
create table share_grants (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  grantee_id  uuid references accounts(id),     -- null = link-based grant
  role        text not null check (role in ('viewer','editor','admin')),
  invite_email text,                            -- for not-yet-registered invitees
  token_hash  text,                             -- for share-link grants
  expires_at  timestamptz,
  created_by  uuid not null references accounts(id),
  created_at  timestamptz default now()
);

-- version history (non-GitHub projects); large snapshots go to Storage
create table versions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  label       text,
  blob_path   text not null,    -- Supabase Storage object (gzipped snapshot)
  created_at  timestamptz default now()
);
```

## Row Level Security (the reason we chose Supabase)

RLS maps directly onto share semantics. Enable RLS on every table.

```sql
alter table projects enable row level security;

-- read: owner OR an unexpired grant exists for this user
create policy project_read on projects for select using (
  owner_id = auth.uid()
  or exists (
    select 1 from share_grants g
    where g.project_id = projects.id
      and g.grantee_id = auth.uid()
      and (g.expires_at is null or g.expires_at > now())
  )
);

-- write: owner OR editor/admin grant
create policy project_write on projects for update using (
  owner_id = auth.uid()
  or exists (
    select 1 from share_grants g
    where g.project_id = projects.id
      and g.grantee_id = auth.uid()
      and g.role in ('editor','admin')
      and (g.expires_at is null or g.expires_at > now())
  )
);
```

- Mirror read/write policies on `versions` and `share_grants` (only owner/admin
  may create grants).
- Link-based grants (`token_hash`, `grantee_id null`) are resolved by a small
  edge function that validates the hashed token, then issues a scoped session —
  never trust a raw link token in a policy.

## Storage strategy

- Current document: `projects.document` as `jsonb` (small — 0.1–1 MB per project).
- Version snapshots: **gzipped** blobs in Supabase Storage, not the database.
  Token JSON compresses ~5–10x; a 300 KB snapshot → ~30–50 KB. Prefer
  sparse-delta snapshots (store overrides deltas) over full copies.
- Realistic sizing: hundreds of MB to a few GB even at thousands of hosted
  projects. MAUs/compute bind before storage does.

## Self-hosting

- Ship a `docker-compose.yml` running the full Supabase stack (Postgres, GoTrue
  auth, PostgREST, Realtime, Storage, Studio).
- Document env vars and the migration apply step. Self-hosted storage is just disk
  — the tier-quota question disappears; attach a bigger volume.
- The hosted uiorganized.com uses Supabase Cloud (Pro) to avoid running servers;
  adopters can self-host the identical schema.

## Migrations

- Keep SQL migrations in `services/supabase/migrations`. Apply via the Supabase
  CLI. Every schema change is a migration, never a manual dashboard edit.

## Definition of done

- A non-GitHub user signs up, creates a `supabase`-storage project, edits it, and
  the document persists in `projects.document`.
- A second user with a `viewer` grant can read but not write (enforced by RLS,
  verified by a test that attempts a write and is rejected at the DB).
- A `repo`-storage project stores only `repo_ref`, never `document`.
- `docker-compose up` brings up a working self-hosted instance with migrations
  applied.

## Escalation triggers

- Never disable RLS to "make it work." A failing query under RLS means the policy
  is wrong, not that RLS should be off.
- Do not store access tokens, secrets, or PATs in any table.
