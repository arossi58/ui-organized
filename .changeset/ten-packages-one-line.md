---
"@ui-organized/core": major
"@ui-organized/react": major
"@ui-organized/svelte": major
"@ui-organized/vue": major
"@ui-organized/angular": major
"@ui-organized/table-core": major
"@ui-organized/react-table": major
"@ui-organized/vue-table": major
"@ui-organized/svelte-table": major
"@ui-organized/angular-table": major
---

**Ten packages move to one version line at 6.0.0.**

Nine of them have never been published. The tenth, `@ui-organized/react`, was at 5.1.0 and is the reason the shared line starts at 6: a group cannot go backwards, so it takes the highest version in it and moves up together.

**This is a renumbering, not a breakage — and it is worth being exact about that.** `@ui-organized/react`'s public API is unchanged: nothing was removed from its barrel (96 export lines became 140), its `exports` map is byte-identical, and its peer dependencies are untouched. The only change to its manifest is internal — it now depends on `@ui-organized/core` instead of `class-variance-authority`. If you are upgrading from 5.1.0 and only use `@ui-organized/react`, there is no migration: install, and the same imports resolve to the same things.

The reason for the major is that **the design system stopped being one library.** Ten packages that ship together and depend on each other by exact version are much easier to reason about on one line than on ten, and the alternative — `react` at 5.2.0 beside `core` at 0.2.0 and `react-table` at 1.0.0 — makes "which versions go together" a question every consumer has to answer from a changelog.

**What is actually new.** `@ui-organized/core` holds the CSS, the style recipes and the token contract, and the four framework libraries render against it: `@ui-organized/react`, `@ui-organized/svelte`, `@ui-organized/vue` and `@ui-organized/angular`, each with the same 68 components. The data table ships as an engine (`@ui-organized/table-core`) plus one adapter per framework. Every one of those is checked against React's DOM by a parity harness rather than asserted — the four libraries render the same markup, carry the same ARIA and answer the same keys, and the gates that prove it run on every commit.

`@ui-organized/core` is a **dependency** of each framework library, not a peer, so nobody has a new install step and no import path changed. `@ui-organized/tokens` and `@ui-organized/utils` keep their own version lines: they are consumed by things outside this group.
