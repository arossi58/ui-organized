import type { ComponentType } from "react";
import { DataTable as RDataTable, type TableColumn } from "@ui-organized/react-table";
import {
  MEMBERS,
  columnsFor,
  memberRowId,
  type ColumnSet,
  type Member,
} from "../fixtures/tableFixture.js";
import SvelteDataTableFixture from "../fixtures/DataTableFixture.svelte";
import VueDataTableFixture from "../fixtures/vue/DataTableFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * The data table, with only the React builder.
 *
 * ── Why a case with one builder is worth landing ────────────────────────────
 *
 * `ParitySpec.svelte` and `.vue` are optional by design, and this is the reason
 * they are: a component exists in one library before it exists in the others,
 * and the gate should stay green while the rest catch up rather than going red
 * for work nobody has started. Adding a fixture here is the whole of what "this
 * framework now has a data table" means, and the gate's own case count is the
 * only honest tally of where the port has got to.
 *
 * Landing it *first*, before any port, is deliberate. The props contract is the
 * real design question in porting this component — see `../fixtures/tableFixture.ts`
 * — and answering it against one library is cheap. Answering it against three
 * that have already been written is a rewrite of all three.
 *
 * ── What the static gate can and cannot see ─────────────────────────────────
 *
 * Rather more than for the overlays: a table renders its whole header, body and
 * `<colgroup>` on the server, so the column widths, alignments, `scope="row"`
 * placement, `aria-sort` and the sticky offsets are all pinned here. What is
 * *not* is anything behind a measurement — virtualization, the horizontal scroll
 * controls, the responsive card switch — because all three need a viewport with
 * a width, and the server has none. Those belong to the browser scenarios.
 */
const spec: ParitySpec = {
  component: "DataTable",
  react: ({ columnSet, rowActions, noData, ...p }) => (
    <RDataTable<Member>
      data={noData ? [] : MEMBERS}
      columns={columnsFor(columnSet as ColumnSet) as unknown as TableColumn<Member>[]}
      getRowId={memberRowId}
      label="Members"
      // The functions the case cannot carry, built here — see the fixture module
      // for why this indirection exists rather than passing them as props.
      rowActions={
        rowActions
          ? [
              { id: "edit", label: "Edit", onRun: () => {} },
              { id: "remove", label: "Remove", destructive: true, onRun: () => {} },
            ]
          : undefined
      }
      {...p}
    />
  ),
  svelte: SvelteDataTableFixture as unknown as ComponentType<any>,
  vue: VueDataTableFixture as unknown as ComponentType<any>,
  /**
   * Every portalled surface the table's chrome puts on the page.
   *
   * The same reason `Menu`'s case excludes its positioner, multiplied by the six
   * overlays a toolbar contains: React renders portalled content inline under
   * SSR and Vue teleports, so a menu's content element exists on one side and
   * not the other. `exclude` runs *before* the ids are numbered, which is what
   * makes both sides agree — with the content gone, each falls back to the
   * machine-id normalisation and the trigger's `data-controls` matches.
   *
   * What is dropped is unreachable statically anyway: none of it renders open,
   * and the browser scenarios are where an opened menu is compared.
   */
  exclude: [
    '[data-scope="menu"][data-part="positioner"]',
    '[data-scope="popover"][data-part="positioner"]',
    '[data-scope="select"][data-part="positioner"]',
    '[data-scope="dialog"][data-part="positioner"]',
    '[data-scope="dialog"][data-part="backdrop"]',
  ].join(", "),
  allowTextIn: [
    {
      selector: "select option",
      reason:
        "The pagination row's page-size Select. Ark Vue's HiddenSelect renders " +
        'an option\'s text as "25 > " where Ark React renders "25" — it ' +
        "stringifies through the collection's path join. The element is the " +
        "hidden native select, which exists only so the value is submitted with " +
        "a form: it is aria-hidden and visually hidden, the submitted value is " +
        "the option's `value` rather than its text, and no user or screen reader " +
        "ever encounters the difference. Same allowance the Select case carries, " +
        "and the assertion below fails if that element ever stops being " +
        "aria-hidden.",
    },
  ],
  cases: [
    { name: "default" },
    { name: "size/sm", props: { size: "sm" } },
    { name: "size/md", props: { size: "md" } },
    { name: "size/lg", props: { size: "lg" } },
    { name: "variant/bordered", props: { variant: "bordered" } },
    // The caption is the table's accessible name. Visible or not, it is there —
    // a table announced as "table" and nothing else is the commonest data-table
    // accessibility failure, so this is worth pinning in both states.
    { name: "caption visible", props: { captionVisible: true } },
    { name: "selection/multiple", props: { selection: "multiple" } },
    { name: "selection/single", props: { selection: "single" } },
    // Sorted through `defaultSorting` rather than by clicking, because the
    // static gate cannot click. `aria-sort` and the header button's state are
    // the contract.
    { name: "sorted ascending", props: { defaultSorting: [{ id: "name", desc: false }] } },
    { name: "sorted descending", props: { defaultSorting: [{ id: "name", desc: true }] } },
    // The only way to render a filter chip without opening a dropdown.
    {
      name: "with a filter chip",
      // `values`, always an array — one shape means one code path in the
      // predicate and in every server translator. See TableFilterCondition.
      props: { defaultFilters: [{ columnId: "role", operator: "is", values: ["Owner"] }] },
    },
    { name: "paginated", props: { paginated: true, pageSize: 5 } },
    { name: "searchable", props: { searchable: true } },
    { name: "with row actions", props: { rowActions: true } },
    { name: "hidden column", props: { defaultColumnVisibility: { email: false } } },
    // A pinned column is a property of the column, so it comes from the fixture's
    // second set rather than from a prop — see `PINNED_MEMBER_COLUMNS`.
    { name: "pinned column", props: { columnSet: "pinned" } },
    { name: "loading", props: { loading: true } },
    { name: "empty", props: { noData: true, empty: { title: "No members" } } },
  ],
};

export default spec;
