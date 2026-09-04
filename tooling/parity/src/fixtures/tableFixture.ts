/**
 * The one dataset and column set every `DataTable` fixture renders.
 *
 * ── Why this file exists, and what it settles ───────────────────────────────
 *
 * Every other component in this gate takes its whole configuration through
 * `ParityCase.props`, which crosses into the browser harness as a JSON string in
 * a URL. That works because a Button's props are strings and booleans. A table's
 * are not: columns carry `cell` renderers, `getRowId` is a function, row actions
 * carry `onRun`, and none of it survives `JSON.stringify`.
 *
 * So the contract splits in two, and the split is the design decision:
 *
 *  - **The shape lives here**, in framework-free data every fixture imports. The
 *    rows and the column definitions are the same objects in all four libraries,
 *    which is what makes a DOM difference mean something. Four fixtures each
 *    declaring their own columns would drift on a label or a width and report it
 *    as a port bug.
 *  - **The switches live in the case**, as JSON: `size`, `selection`, `paginated`,
 *    `defaultSorting` and the rest. Those are what a scenario varies.
 *
 * Anything that genuinely needs a function is named by a boolean switch here and
 * *built* by each fixture — `rowActions: true` rather than the actions
 * themselves. That is the only place a fixture writes framework-specific code,
 * and it is exactly the code a consumer writes.
 *
 * ── Why the columns are pure data ───────────────────────────────────────────
 *
 * They can be, which is the point `@ui-organized/table-core` has been making all
 * along: a column is `accessorKey`, `header` and a `meta` block of alignment,
 * width, pinning and filter settings. The one framework-shaped field in
 * `TableColumnMeta` is `edit.render`, and nothing here uses it. So this file
 * imports no framework and is legal in a `.svelte`, a `.vue`, an Angular
 * component and a `.tsx` alike.
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "active" | "invited" | "suspended";
  seats: number;
  joined: string;
}

const ROLES = ["Owner", "Admin", "Engineer", "Designer", "Analyst"];
const TEAMS = ["Platform", "Growth", "Design", "Data", "Support"];
const STATUSES: Member["status"][] = ["active", "invited", "suspended"];
const FIRST = ["Ada", "Grace", "Alan", "Katherine", "Linus", "Barbara", "Edsger", "Radia"];
const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Johnson",
  "Torvalds",
  "Liskov",
  "Dijkstra",
  "Perlman",
];

/**
 * Deterministic, and small.
 *
 * Deterministic because the gate diffs rendered DOM and a fixture that generated
 * different names each run could never be green twice. Small because every row
 * is compared element by element in four libraries — eight rows is enough to
 * exercise sorting, selection and pagination, and few enough that a failure
 * prints something a person can read.
 */
export function makeMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m-${index}`,
    name: `${FIRST[index % FIRST.length]} ${LAST[(index * 3) % LAST.length]}`,
    email: `${FIRST[index % FIRST.length]!.toLowerCase()}.${index}@example.com`,
    role: ROLES[index % ROLES.length]!,
    team: TEAMS[(index * 2) % TEAMS.length]!,
    status: STATUSES[index % STATUSES.length]!,
    seats: 1 + ((index * 7) % 12),
    joined: `20${20 + (index % 5)}-0${1 + (index % 9)}-1${index % 10}`,
  }));
}

export const MEMBERS: Member[] = makeMembers(8);

/**
 * The column set, as plain data.
 *
 * Deliberately not typed as `TableColumn<Member>`: that type lives in
 * `@ui-organized/table-core`, and a Vue or Svelte fixture importing it would
 * pull the engine into a file whose only job is to describe six columns. Each
 * fixture applies its own package's type at the point of use, which is also the
 * only place the type could be wrong.
 *
 * The `meta` blocks are the interesting half — `primary` decides which cell is a
 * `<th scope="row">`, `sticky` decides what pins, `align` and `width` reach the
 * `<colgroup>` — so they are what the gate is really comparing.
 */
export const MEMBER_COLUMNS = [
  { accessorKey: "name", header: "Name", meta: { primary: true, width: 180, filter: true } },
  { accessorKey: "email", header: "Email", meta: { width: 220 } },
  { accessorKey: "role", header: "Role", meta: { width: 120, filter: { type: "enum" } } },
  { accessorKey: "team", header: "Team", meta: { width: 120, priority: 1 } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end", width: 90, filter: true } },
  { accessorKey: "joined", header: "Joined", meta: { width: 120 } },
] as const;

/**
 * The same columns with the first one pinned.
 *
 * A separate set rather than a `sticky` switch on the case, because pinning is a
 * property of a *column* and the case props cannot reach inside one. The two
 * sets are otherwise identical, so a diff between them is the pinning and
 * nothing else.
 */
export const PINNED_MEMBER_COLUMNS = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { primary: true, width: 180, filter: true, sticky: "left" },
  },
  ...MEMBER_COLUMNS.slice(1),
] as const;

/**
 * The same columns, far too wide for any viewport.
 *
 * The only way to make a table overflow horizontally from a props object: the
 * harness pages have a fixed width and the case cannot style them, so the
 * overflow has to come from the columns. Six columns at 400px is 2400px, which
 * is wider than any browser this gate runs in — so the scroll controls appear
 * because there is genuinely somewhere to scroll to, which is the condition they
 * render on.
 */
export const WIDE_MEMBER_COLUMNS = MEMBER_COLUMNS.map((column) => ({
  ...column,
  meta: { ...column.meta, width: 400 },
}));

/**
 * Wide *and* pinned — the only arrangement in which pinning does anything.
 *
 * A sticky column in a table that fits its viewport is a sticky column with
 * nothing to stick against: the offsets are in the markup and no pixel moves. So
 * the browser scenario that means to exercise pinning needs both.
 */
export const PINNED_WIDE_MEMBER_COLUMNS = WIDE_MEMBER_COLUMNS.map((column, index) =>
  index === 0 ? { ...column, meta: { ...column.meta, sticky: "left" as const } } : column,
);

/** Stable row identity, so selection and the cursor survive a sort. */
export const memberRowId = (row: Member) => row.id;

/**
 * Which column set a scenario wants. The case passes the name; the fixture
 * resolves it, because only the fixture knows its own package's column type.
 */
export type ColumnSet = "default" | "pinned" | "wide" | "pinned-wide";

export function columnsFor(set: ColumnSet | undefined) {
  if (set === "pinned") return PINNED_MEMBER_COLUMNS;
  if (set === "wide") return WIDE_MEMBER_COLUMNS;
  if (set === "pinned-wide") return PINNED_WIDE_MEMBER_COLUMNS;
  return MEMBER_COLUMNS;
}
