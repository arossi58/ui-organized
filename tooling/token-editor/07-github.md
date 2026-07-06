# 07 — GitHub Connection

> Goal: connect the editor to GitHub for (a) authentication, (b) repo-as-store
> read/write of the project document, and (c) committing/opening PRs. Keep the
> self-host path fully backendless; the only optional server is a single stateless
> OAuth-exchange function.

## Authentication options (pick per deployment)

The client secret can never ship in a public client, and **PKCE does not remove
the secret requirement for GitHub** (GitHub does not distinguish public vs
confidential clients). So the viable backendless options are:

1. **Device flow (zero infra, default for self-host).**
   - App requests a device + user code, shows the user a code to enter at
     `github.com/login/device`, polls for the token. No client secret needed.
   - Tradeoff: extra step (paste a code); GitHub flags device flow as intended for
     constrained environments. Acceptable here; document the security note.

2. **Single stateless OAuth-exchange function (best UX, near-zero cost).**
   - One serverless function (Cloudflare Worker / Netlify / Vercel) whose ONLY job
     is the `code → access_token` exchange, holding the client secret as an env
     var. No DB, no sessions. This is the Decap/TinaCMS pattern.
   - Use for the hosted uiorganized.com deployment.

3. **User-pasted fine-grained PAT (escape hatch).**
   - Zero infra. Worst UX. Scope to the single repo. Offer as a fallback.

> Implement device flow first (works everywhere, no secret). Add the exchange
> function for the hosted tier. Always scope tokens to the **single repo**.

## Token handling (security)

- Never store the access token in `localStorage`. Keep it in memory; for the
  hosted tier, prefer an httpOnly session cookie set by the exchange function.
- Never put the token in a URL or query string.
- Request the **minimum scope**: contents read/write on the target repo, and PR
  scope. Fine-grained tokens preferred.

## Repo-as-store layout

The project document lives in the user's repo. Suggested layout:

```
<repo>/
  tokens/
    project.json            # ProjectDocument (config + overrides + recipes meta)
    sets/
      core.json             # one file per token set (merge-safe)
      semantic.json
      brand-x.json
    manifest.json           # set → file map, themes, modes
  .uiorganized.json         # editor config (repo settings, default branch)
```

- **Split sets into separate files.** Two people editing different sets never
  collide. This is the primary merge-safety strategy.
- `manifest.json` is the index the editor reads first to know which files compose
  the document.

## Read / write flow (`packages/token-io`, GitHub adapter)

- **Read**: fetch `manifest.json`, then each set file, via the GitHub Contents API
  (or git trees for efficiency). Assemble into a `ProjectDocument`. Cache in
  IndexedDB.
- **Write (commit)**: serialize changed set files only. Commit to a working branch.
- **Publish (PR)**: open a PR from the working branch to the default branch so CI
  (contract + drift tests) gates the change before `main`. Opening a PR and
  merging are **permissioned actions** — surface a confirmation; never auto-merge.
- **Sync / pull**: re-fetch and reconcile against the IndexedDB working cache. On
  conflict (rare with file-splitting), present a structured diff; the override
  model shrinks the collision surface further.

## Branching

- Read the target branch from `.uiorganized.json`; allow switching in the UI.
- Editor commits go to a short-lived working branch, PR into the target.

## Relationship to the rest of the system

- For repo users, **the repo is canonical**. IndexedDB is a disposable cache.
  Supabase (if present) holds identity and share grants, never a competing copy of
  the tokens (see `10-auth-and-sharing.md`).
- The same committed files feed the Style Dictionary build in GitHub Actions
  (see `11-export.md`) and the Figma plugin's source (see `08-figma-plugin.md`).

## Definition of done

- Device flow authenticates and returns a repo-scoped token, held in memory only.
- Editor reads a multi-file token repo into a `ProjectDocument` and renders it.
- Editing a set, committing, and opening a PR works end to end, with explicit
  confirmation before the PR is created.
- Re-pull after an external change reconciles cleanly with the local cache.

## Escalation triggers

- Do NOT open a PR, merge, change repo settings, or modify branch protection
  without explicit user confirmation in the UI. These are permissioned actions.
- If GitHub has changed device-flow or OAuth-app behavior since this doc, confirm
  the current flow before implementing token handling.
