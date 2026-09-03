# @ui-organized/table-core

The framework-neutral half of the ui-organized data table.

Everything here is decided once and reused by every framework adapter: the column
model, the filter model and its predicates, the prop builders that produce the markup
contract, the behaviours (grid keyboard, selection, inline edit, row detail, responsive
mode), the export and clipboard serializers, and the entire stylesheet.

Nothing in this package imports a framework. That is enforced rather than
intended — a `no-restricted-imports` block in the repo's ESLint config bans
`react`, `react-dom`, `@ui-organized/react` and the per-framework TanStack
adapters from `src/**`, and `src/purity.test.ts` asserts the published manifest
declares no framework dependency or peer.

## What it is for

A data table is the largest single component in a design system and the one that
most justifies living outside the component library: a table engine plus a
virtualizer is a transitive dependency that every consumer of `Button` would
otherwise pay for at install time.

Splitting it in two again — engine and adapter — is what makes a second framework
a new adapter rather than a fork. A Vue table is
`packages/vue-table` depending on this package plus `@tanstack/vue-table`,
rendering the same class names against Vue's own design-system controls and
importing this same stylesheet. No fork of the logic, no second stylesheet, no
second token contract.

## Using it directly

You usually want an adapter — [`@ui-organized/react-table`](../react-table) — not
this package. Reach for it directly when you are writing one:

```ts
import {
  coreTableOptions,   // the shared TanStack options
  getCellProps,       // the markup contract
  gridKeyDown,        // behaviours, as pure functions
  rangeSelect,
  evaluateCondition,  // the filter predicate — identifier + relative + value
  describeCondition,  // and the words a chip renders, so adapters cannot diverge
  createEditStore,    // state machines, as { getState, subscribe, dispatch }
  serializeRows,
} from "@ui-organized/table-core";
```

The three shapes an adapter binds to:

- **Prop builders** return plain objects of `className` / `style` / `aria-*` /
  `data-*` / `tabIndex`. Spread one onto an element and nothing else.
- **Behaviours** are pure functions over normalized input, never over DOM or
  synthetic events: `gridKeyDown(state, { key, shift, ctrl, meta })` returns an
  action. Translating a framework's event into that shape is the adapter's only
  job there.
- **Stores** are `{ getState, subscribe, dispatch }` — the exact shape React's
  `useSyncExternalStore` wants, and the one Vue binds with `shallowRef` +
  `onScopeDispose`.

## The stylesheet

```ts
import "@ui-organized/tokens/variables.css";
import "@ui-organized/table-core/styles";
```

Every value is a token reference; `token-contract.json` lists the 48 custom
properties a theme must supply, all of which the component library already
requires. Class names are global and BEM-ish, so a second adapter renders the
same markup and inherits the same look for free.

## Licence

Apache-2.0
