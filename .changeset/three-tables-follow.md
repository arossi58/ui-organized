---
"@ui-organized/vue-table": minor
"@ui-organized/svelte-table": minor
"@ui-organized/angular-table": minor
"@ui-organized/table-core": minor
"@ui-organized/react-table": minor
---

**The data table, for the other three frameworks.** `@ui-organized/vue-table`, `@ui-organized/svelte-table` and `@ui-organized/angular-table` join `@ui-organized/react-table`, all four on the same `@ui-organized/table-core`.

```ts
import "@ui-organized/tokens/variables.css";
import "@ui-organized/vue/styles"; // or svelte, or angular
import "@ui-organized/vue-table/styles";
```

The promise the table's first changeset made — _"same class names, same stylesheet, same token contract, no fork of the logic"_ — is now checked rather than asserted. Every scenario in the parity harness's `DataTable` suite compares all four libraries against React's DOM, and nothing is skipped: the four tables render the same markup, carry the same ARIA and respond to the same keys.

Each adapter has the same three layers as React's. The headless one is spelled the way its framework spells things — `useDataTable(options)` reading its options reactively, `createDataTable(() => options)` returning getters over `$derived`, `createDataTable(options)` returning signals — and everything below that is the engine.

**Three things each framework had to answer for itself.** None of them has `useDeferredValue`, and the table depends on the split it provides: the search string and the filter conditions update urgently so a controlled input never lags a keystroke, while the row-model pass they drive reads a deferred copy. All three landed on the same answer — an idle callback with a deadline — deliberately, because three designs for one problem in one design system would be a defect in itself. The roving cursor and the inline-edit focus hand-off port directly; their effect keying does not, and each is written against its own scheduler.

**Angular's are structural.** Every part is an attribute directive, because HTML's table content model parses an unknown element _out_ of a `<table>` and hoists it before it — a `<uio-table-row>` between `<tbody>` and `<tr>` silently loses every row. That is also what keeps the DOM identical to React's, since a directive adds no node; parts that render nothing in some state remove and restore their own host element. Angular has no prop spread, so core's eleven prop builders are applied by a directive that diffs the previous bag against the next one; and its toolbar is one part rather than six, because six components would be six nodes the other three libraries do not render. That last one is a real difference in what a consumer can compose, and it is written down in the package README rather than glossed.

**A bug in the shipped React table, found by bringing the others up beside it.** A page-size picker offering 10 / 25 / 50 / 100 has no correct rendering for a `pageSize` of 3, and each framework picked a different wrong answer: a native `<select>` falls back to its first option, so React's showed "10" while the table paged by 3. The fix is in the engine — `pageSizeOptions(offered, current)` folds the size in effect into the offered list, so the control can always show the truth — and all four adapters use it. `pageSize` comes from `defaultPageSize`, a controlled `pagination` state or a restored URL, none of which is obliged to be one of the four offered.

**ARIA booleans are enumerated, not present.** `aria-selected="true"` and `aria-selected="false"` are two different answers and `aria-selected=""` is neither; the Angular adapter briefly wrote all three as presence, the way a `data-` state flag is written, which reads a selected row to a screen reader as unselected. Fixed, and the distinction is now explicit in the one place that applies attributes.

Each package ships its own consumer smoke gate — `examples/<framework>-table-smoke`, built for real and its rendered output asserted — because the failures that matter here are consequences of bundling. A wrong `exports` or `sideEffects` entry lets a bundler drop half the table while the build stays green, and `@ui-organized/<framework>-table/styles` resolves to a file that physically lives in `table-core`'s dist, which is exactly the kind of indirection that silently resolves to an empty file. An unstyled table renders, passes every assertion about its markup, and is unusable.
