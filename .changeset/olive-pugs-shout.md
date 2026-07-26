---
"@ui-organized/react": major
---

**Breaking:** icon libraries now load through per-library subpaths. Add one import.

```diff
+ import "@ui-organized/react/icons/lucide";   // or /tabler, or /heroicons

  <IconProvider library="lucide" style="outline">
```

That is the whole migration. Everything else about `IconProvider` and `<Icon>` is unchanged, and forgetting it is loud rather than silent — `<Icon>` renders nothing and logs the exact line to add.

**Why it had to break.** All three icon libraries were declared optional peers, but `dist/index.mjs` imported all three with static top-level `import` statements. `optional` only suppresses npm's install-time warning; at bundle time every one of them was a hard requirement. An app that used only Lucide, with only Lucide installed, failed its production build with 168 errors:

```
[MISSING_EXPORT] "IconArrowDown" is not exported by
"__vite-optional-peer-dep:@tabler/icons-react:@ui-organized/react"
```

…for a library it never referenced. The alternative fixes were worse: declaring all three as hard peers means 96 MB of icon packages in every install, and lazy `import()` would make the most common element in the system render a frame late.

Now the main entry imports no icon library at all. Each library lives behind its own subpath, which is the only module that touches it, so the ones you don't import are never resolved — not at install, not at build. `<Icon>` stays synchronous.

Also in this release:

- `IconProvider` accepts an `icons` prop, if you'd rather pass the set explicitly than rely on an import side effect: `import { lucideIcons } from "@ui-organized/react/icons/lucide"`.
- **`render`-prop triggers no longer discard `children`.** `<PopoverTrigger render={<Button icon="plus" />}>Add item</PopoverTrigger>` silently dropped "Add item", giving an icon-only button with no label and no warning. Children are now projected into the rendered element; when that element already has its own children the combination is ambiguous, so the library keeps its children and warns in development. Fixed at all nine sites — Dialog, AlertDialog, Popover, Menu, HoverCard and Sheet triggers and closes.
- `IconProvider`'s context value is memoised, so it no longer re-renders every `<Icon>` in the tree on each parent render.
