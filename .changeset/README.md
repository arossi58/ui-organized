# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).
It records human-readable summaries of changes that have not yet been released.

To add a changeset after making a change to one or more packages:

```sh
pnpm changeset
```

Pick the affected packages, choose a semver bump (patch/minor/major), and write
a short summary. Commit the generated `.changeset/*.md` file with your change.

Releases then run:

```sh
pnpm version-packages   # changeset version — applies bumps + writes changelogs
pnpm release            # build, then changeset publish to npm
```

See the [common questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
for more.
