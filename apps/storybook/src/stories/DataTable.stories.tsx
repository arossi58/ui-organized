import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Input, Tag } from "@ui-organized/react";
import { DataTable, type DataTableQuery, type TableColumn } from "@ui-organized/react-table";

// ─── Fixture ─────────────────────────────────────────────────────────────────

interface Member {
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
 * Deterministic rather than random: a visual baseline compares pixels, so a
 * story that generates different names on every run can never be green twice.
 */
function makeMembers(count: number): Member[] {
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

const MEMBERS = makeMembers(24);
const MANY_MEMBERS = makeMembers(100_000);

const STATUS_VARIANT: Record<Member["status"], "success" | "info" | "error"> = {
  active: "success",
  invited: "info",
  suspended: "error",
};

const columns: TableColumn<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { primary: true, width: 200, filter: true },
  },
  { accessorKey: "email", header: "Email", meta: { width: 240 } },
  {
    accessorKey: "role",
    header: "Role",
    meta: { width: 140, filter: { type: "enum" } },
  },
  {
    accessorKey: "team",
    header: "Team",
    meta: { width: 140, priority: 1, filter: { type: "enum" } },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: 140, filter: { type: "enum" } },
    cell: ({ getValue }) => {
      const status = getValue<Member["status"]>();
      // `emphasized={false}` deliberately: the solid Tag's label is a known AA
      // contrast gap in the palette, and a table is the last place to add
      // dozens of instances of it.
      return (
        <Tag variant={STATUS_VARIANT[status]} size="sm" emphasized={false}>
          {status}
        </Tag>
      );
    },
  },
  {
    accessorKey: "seats",
    header: "Seats",
    meta: { align: "end", width: 100, filter: true },
  },
  { accessorKey: "joined", header: "Joined", meta: { width: 140, filter: true } },
];

const meta: Meta<typeof DataTable> = {
  title: "Components/Data Display/Data Table",
  component: DataTable,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A virtualized data table built on real `<table>` semantics. Ships as its own package — `@ui-organized/react-table` — so consumers of the component library do not pay for a table engine at install time. Three layers: the `useDataTable` hook, the styled parts (`TableHeader`, `TableRow`, …), and this batteries-included wrapper.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "bordered"] },
    selection: { control: "select", options: ["none", "single", "multiple"] },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <DataTable<Member>
      {...(args as object)}
      label="Team members"
      columns={columns}
      data={MEMBERS.slice(0, 8)}
      getRowId={(row) => row.id}
      maxHeight={420}
    />
  ),
  args: { size: "md", variant: "default", selection: "none" },
  parameters: {
    docs: {
      source: {
        code: `
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "active" | "invited" | "suspended";
  seats: number;
  joined: string;
}

const columns: TableColumn<Member>[] = [
  // \`primary\` marks the identifying column: it becomes the row header, the
  // card title, and the column pinned left on a narrow viewport.
  { accessorKey: "name", header: "Name", meta: { primary: true, width: 200, filter: true } },
  { accessorKey: "email", header: "Email", meta: { width: 240 } },
  { accessorKey: "role", header: "Role", meta: { width: 140, filter: { type: "enum" } } },
  { accessorKey: "team", header: "Team", meta: { width: 140, filter: { type: "enum" } } },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: 140, filter: { type: "enum" } },
    // A cell renderer is just a component — compose the library freely.
    cell: ({ getValue }) => (
      <Tag variant="info" size="sm" emphasized={false}>
        {getValue<string>()}
      </Tag>
    ),
  },
  { accessorKey: "seats", header: "Seats", meta: { align: "end", width: 100, filter: true } },
  { accessorKey: "joined", header: "Joined", meta: { width: 140, filter: true } },
];

<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={420}
/>
`.trim(),
      },
    },
  },
};

// ─── Data types ──────────────────────────────────────────────────────────────

interface Signal {
  id: string;
  name: string;
  owner: { team: string };
  score: number;
  active: boolean;
  tier: "gold" | "silver" | "bronze";
  createdAt: Date;
  updatedIso: string;
}

const SIGNALS: Signal[] = [
  {
    id: "s1",
    name: "Checkout latency",
    owner: { team: "Platform" },
    score: 92,
    active: true,
    tier: "gold",
    createdAt: new Date(2024, 0, 15),
    updatedIso: "2024-06-02",
  },
  {
    id: "s2",
    name: "Signup funnel",
    owner: { team: "Growth" },
    score: 8,
    active: false,
    tier: "silver",
    createdAt: new Date(2023, 10, 2),
    updatedIso: "2024-05-19",
  },
  {
    id: "s3",
    name: "Search relevance",
    owner: { team: "Data" },
    score: 47,
    active: true,
    tier: "bronze",
    createdAt: new Date(2024, 3, 28),
    updatedIso: "2024-06-11",
  },
];

const TIER_VARIANT: Record<Signal["tier"], "success" | "info" | "caution"> = {
  gold: "success",
  silver: "info",
  bronze: "caution",
};

const typedColumns: TableColumn<Signal>[] = [
  // Text. `primary` makes it the row header and the card title.
  { accessorKey: "name", header: "Signal", meta: { primary: true, width: 200, filter: true } },
  // A dot path reaches nested data — and note the column's *id* becomes
  // `owner_team`, which is what TanStack derives. Enums are always declared.
  {
    accessorKey: "owner.team",
    header: "Team",
    meta: { width: 130, filter: { type: "enum" } },
  },
  // Numbers align end; the type is inferred.
  { accessorKey: "score", header: "Score", meta: { align: "end", width: 90, filter: true } },
  // A boolean would render as the word "false". Give it a renderer, and an
  // `exportValue` so CSV gets something better than the rendered markup.
  {
    accessorKey: "active",
    header: "Active",
    meta: {
      width: 110,
      filter: true,
      exportValue: (row) => (row.active ? "yes" : "no"),
    },
    cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
  },
  // An enum: declared, never inferred from cardinality.
  {
    accessorKey: "tier",
    header: "Tier",
    meta: { width: 120, filter: { type: "enum" } },
    cell: ({ getValue }) => {
      const tier = getValue<Signal["tier"]>();
      return (
        <Tag variant={TIER_VARIANT[tier]} size="sm" emphasized={false}>
          {tier}
        </Tag>
      );
    },
  },
  // A Date renders as "Mon Jan 15 2024 00:00:00 GMT-0600 (…)" unformatted —
  // long, and timezone-dependent. Format it; the filter reads the Date fine.
  {
    accessorKey: "createdAt",
    header: "Created",
    meta: { width: 130, filter: true },
    cell: ({ getValue }) => getValue<Date>().toISOString().slice(0, 10),
  },
  // An ISO string needs nothing at all — the easiest way to hold a date.
  { accessorKey: "updatedIso", header: "Updated", meta: { width: 130, filter: true } },
  // Computed values need an explicit `id`, and an explicit filter type.
  {
    id: "perDay",
    accessorFn: (row) => Math.round(row.score / 7),
    header: "Per day",
    meta: { align: "end", width: 100, filter: { type: "number" } },
  },
];

export const DataTypes: Story = {
  name: "Data types",
  render: () => (
    <DataTable<Signal>
      label="Signals"
      columns={typedColumns}
      data={SIGNALS}
      getRowId={(row) => row.id}
      exportable
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Every column reaches its value with `accessorKey` (including a dot path), or an `accessorFn` plus an explicit `id`. A value with no `cell` renderer is stringified, which is right for strings, numbers and ISO date strings — and wrong for a `Date` (long, and timezone-dependent) and for booleans. The filter type is inferred from the data, except where inference cannot see it: through an `accessorFn`, for numbers held as strings, and for enums, which are declared rather than guessed from cardinality.",
      },
      source: {
        code: `
interface Signal {
  id: string;
  name: string;
  owner: { team: string };
  score: number;
  active: boolean;
  tier: "gold" | "silver" | "bronze";
  createdAt: Date;
  updatedIso: string;
}

const columns: TableColumn<Signal>[] = [
  // Text. \`primary\` makes it the row header and the card title.
  { accessorKey: "name", header: "Signal", meta: { primary: true, width: 200, filter: true } },

  // A dot path reaches nested data, and its column id becomes \`owner_team\` —
  // TanStack's rule. Enums are always declared, never inferred.
  { accessorKey: "owner.team", header: "Team", meta: { filter: { type: "enum" } } },

  // Numbers align end. The type is inferred.
  { accessorKey: "score", header: "Score", meta: { align: "end", filter: true } },

  // A bare boolean renders as the word "false". Give it a renderer — and an
  // \`exportValue\`, so CSV gets a value rather than the rendered markup.
  {
    accessorKey: "active",
    header: "Active",
    meta: { filter: true, exportValue: (row) => (row.active ? "yes" : "no") },
    cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
  },

  // An enum is declared, never inferred from cardinality: cardinality changes
  // as data streams in, and the filter editor's shape would flip mid-session.
  {
    accessorKey: "tier",
    header: "Tier",
    meta: { filter: { type: "enum" } },
    cell: ({ getValue }) => <Tag variant="info" size="sm" emphasized={false}>{getValue<string>()}</Tag>,
  },

  // A Date renders as "Mon Jan 15 2024 00:00:00 GMT-0600 (…)" — long, and
  // timezone-dependent, so it differs between machines. Format it. The filter
  // reads the Date correctly either way.
  {
    accessorKey: "createdAt",
    header: "Created",
    meta: { filter: true },
    cell: ({ getValue }) => getValue<Date>().toISOString().slice(0, 10),
  },

  // An ISO string needs nothing — the easiest way to hold a date.
  { accessorKey: "updatedIso", header: "Updated", meta: { filter: true } },

  // Computed values need an explicit \`id\`, and an explicit filter type.
  {
    id: "perDay",
    accessorFn: (row) => Math.round(row.score / 7),
    header: "Per day",
    meta: { align: "end", filter: { type: "number" } },
  },
];

<DataTable
  label="Signals"
  columns={columns}
  data={signals}
  // Stable row identity: selection, inline edit and the detail sheet are keyed
  // by it. Without one, rows are identified by position and a selection moves
  // onto different rows the moment you sort.
  getRowId={(row) => row.id}
  exportable
/>
`.trim(),
      },
    },
  },
};

export const SortingAndFiltering: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      maxHeight={480}
      defaultSorting={[{ id: "name", desc: false }]}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Every column sorts by default. \`defaultSorting\` picks the initial order;
// the header button carries \`aria-sort\` so the state is announced.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={480}
  defaultSorting={[{ id: "name", desc: false }]}
/>
`.trim(),
      },
    },
  },
};

/**
 * The chips a table starts with. `defaultFilters` is also the only way a chip
 * reaches a static surface — a visual baseline, an axe scan, a jsdom test —
 * none of which can open a dropdown to add one.
 */
export const Filtering: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      maxHeight={480}
      defaultFilters={[
        { columnId: "role", operator: "is-any-of", values: ["Owner", "Admin"] },
        { columnId: "joined", operator: "gt", values: ["2021-01-01"] },
        { columnId: "name", operator: "contains", values: [] },
      ]}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// A column is filterable when its meta says so. \`true\` is enough — the type
// is inferred from the data — and only these columns are offered in the picker.
const columns: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  { accessorKey: "joined", header: "Joined", meta: { filter: true } },
  // Restrict the operators offered, and pick which one a new chip starts on:
  { accessorKey: "seats", header: "Seats", meta: {
    filter: { type: "number", operators: ["between", "gte"], defaultOperator: "between" },
  } },
];

<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={480}
  // Seeds the chips. Several conditions may target one column and are ANDed;
  // one with no value is shown but does not filter.
  defaultFilters={[
    { columnId: "role", operator: "is-any-of", values: ["Owner", "Admin"] },
    { columnId: "joined", operator: "gt", values: ["2021-01-01"] },
    { columnId: "name", operator: "contains", values: [] },
  ]}
/>
`.trim(),
      },
      description: {
        story:
          'Filters are built from **identifier + relative + value** — "Role · is any of · Owner, Admin". Start one from the funnel button in the header; each becomes a `Chip` on the line below, and clicking a chip opens its editor, where the operator, the value and **Remove** all live. Several conditions may target the same field and are combined with AND. The third chip here has no value yet: an incomplete condition is shown but deliberately does not filter, so adding one never blanks the table.',
      },
    },
  },
};

export const Paginated: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      paginated
      pageSize={10}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// \`TablePagination\` converts the row count to a page count for you, and adds
// the page-size control.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  paginated
  pageSize={10}
/>
`.trim(),
      },
    },
  },
};

export const Selection: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      selection="multiple"
      maxHeight={480}
      bulkActions={[
        { id: "export", label: "Export", icon: "download", onRun: () => {} },
        { id: "archive", label: "Archive", icon: "trash", destructive: true, onRun: () => {} },
      ]}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// The bar appears only while something is selected. A destructive action
// routes through AlertDialog before it runs.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  selection="multiple"
  maxHeight={480}
  bulkActions={[
    { id: "export", label: "Export", icon: "download", onRun: (rows) => exportRows(rows) },
    {
      id: "archive",
      label: "Archive",
      icon: "trash",
      destructive: true,
      // \`selection\` also expresses "all 40,000 matching", which an id list cannot.
      onRun: (rows, selection) => archive(selection),
    },
  ]}
/>
`.trim(),
      },
    },
  },
};

export const RowActions: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS.slice(0, 8)}
      getRowId={(row) => row.id}
      maxHeight={420}
      rowActions={[
        { id: "edit", label: "Edit member", icon: "edit", onRun: () => {} },
        { id: "remove", label: "Remove", icon: "trash", destructive: true, onRun: () => {} },
      ]}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// One menu per row rather than a row of buttons: one tab stop instead of
// three, and it survives card mode unchanged.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={420}
  rowActions={[
    { id: "edit", label: "Edit member", icon: "edit", onRun: (row) => edit(row) },
    {
      id: "remove",
      label: "Remove",
      icon: "trash",
      destructive: true,
      disabled: (row) => row.role === "Owner",
      onRun: (row) => remove(row),
    },
  ]}
/>
`.trim(),
      },
    },
  },
};

/**
 * The header's own actions (Figma 2298:629). A vertical rule appears the moment
 * there are any, separating what belongs to the *page* from what belongs to the
 * *table* — sort, filter, export, columns.
 */
export const HeaderActions: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      maxHeight={480}
      exportable
      actions={[
        { id: "import", label: "Import", intent: "secondary", onRun: () => {} },
        { id: "invite", label: "Invite member", intent: "primary", icon: "plus", onRun: () => {} },
      ]}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Each action carries whatever hierarchy the page needs — exactly one of them
// is usually the call to action, and the rest recede. \`iconOnly\` keeps the
// label as the accessible name and drops it from the screen.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  exportable
  actions={[
    { id: "import", label: "Import", intent: "secondary", onRun: importMembers },
    { id: "invite", label: "Invite member", intent: "primary", icon: "plus", onRun: invite },
  ]}
/>
`.trim(),
      },
      description: {
        story:
          "Header actions are real buttons rather than an overflow menu: these are the actions a page is *for*, and a primary action hidden behind a “…” is one nobody finds. The divider only renders when there is something on both sides of it.",
      },
    },
  },
};

export const ColumnTools: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      resizable
      reorderable
      hideableColumns
      exportable
      maxHeight={480}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Resize handles are focusable separators — arrows resize, Shift+arrow
// fine-tunes, Enter resets — so the column widths are keyboard-reachable
// rather than drag-only.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  resizable
  reorderable
  hideableColumns
  exportable
  maxHeight={480}
/>
`.trim(),
      },
    },
  },
};

const pinnedColumns: TableColumn<Member>[] = columns.map((column, index) =>
  index === 0 ? { ...column, meta: { ...column.meta, sticky: "left" as const } } : column,
);

export const PinnedColumns: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={pinnedColumns}
      data={MEMBERS}
      getRowId={(row) => row.id}
      maxHeight={420}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// \`sticky\` pins a column to an edge of the scroll viewport. The offset comes
// from the column's own position, so it stays correct as widths change.
const columns: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, width: 200, sticky: "left" } },
  { accessorKey: "email", header: "Email", meta: { width: 240 } },
  // …the rest scrolls underneath it.
];

<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={420}
/>
`.trim(),
      },
    },
  },
};

function EditableTable() {
  const [rows, setRows] = useState(() => MEMBERS.slice(0, 8));
  const editableColumns = useMemo<TableColumn<Member>[]>(
    () =>
      columns.map((column) =>
        (column as { accessorKey?: string }).accessorKey === "seats"
          ? {
              ...column,
              meta: {
                ...column.meta,
                edit: {
                  render: ({ value, setValue, commit, cancel, size }) => (
                    <Input
                      size={size}
                      type="number"
                      aria-label="Seats"
                      value={String(value ?? "")}
                      onChange={(event) => setValue(Number(event.target.value))}
                      onBlur={commit}
                      onKeyDown={(event) => event.key === "Escape" && cancel()}
                    />
                  ),
                  validate: (value) =>
                    typeof value === "number" && value > 0 ? null : "Seats must be at least 1",
                },
              },
            }
          : column,
      ),
    [],
  );

  return (
    <DataTable<Member>
      label="Team members"
      columns={editableColumns}
      data={rows}
      getRowId={(row) => row.id}
      maxHeight={420}
      onEdit={({ rowId, value }) =>
        setRows((previous) =>
          previous.map((row) => (row.id === rowId ? { ...row, seats: Number(value) } : row)),
        )
      }
    />
  );
}

export const InlineEditing: Story = {
  render: () => <EditableTable />,
  parameters: {
    docs: {
      source: {
        code: `
const [rows, setRows] = useState(members);

const columns: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  {
    accessorKey: "seats",
    header: "Seats",
    meta: {
      edit: {
        // The editor is yours; the package owns the state machine around it —
        // when it opens, what Tab does, and putting focus in the field.
        render: ({ value, setValue, commit, cancel, size }) => (
          <Input
            size={size}
            type="number"
            aria-label="Seats"
            value={String(value ?? "")}
            onChange={(event) => setValue(Number(event.target.value))}
            onBlur={commit}
            onKeyDown={(event) => event.key === "Escape" && cancel()}
          />
        ),
        // Blocks the commit and sets aria-invalid on the cell.
        validate: (value) =>
          typeof value === "number" && value > 0 ? null : "Seats must be at least 1",
      },
    },
  },
];

<DataTable
  label="Team members"
  columns={columns}
  data={rows}
  getRowId={(row) => row.id}
  maxHeight={420}
  // A rejected promise rolls the optimistic value back.
  onEdit={async ({ rowId, value }) => {
    await api.updateSeats(rowId, Number(value));
    setRows((previous) =>
      previous.map((row) => (row.id === rowId ? { ...row, seats: Number(value) } : row)),
    );
  }}
/>
`.trim(),
      },
      description: {
        story:
          "Double-click or press Enter on a Seats cell. Tab commits and moves on, Escape reverts, and a rejected `onEdit` rolls the optimistic value back.",
      },
    },
  },
};

export const RowDetail: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={MEMBERS.slice(0, 10)}
      getRowId={(row) => row.id}
      maxHeight={420}
      detail={{
        title: (row) => row.name,
        description: (row) => row.email,
        render: (row) => (
          <dl className="data-table__card-fields">
            <dt className="data-table__card-label">Role</dt>
            <dd className="data-table__card-value">{row.role}</dd>
            <dt className="data-table__card-label">Team</dt>
            <dd className="data-table__card-value">{row.team}</dd>
            <dt className="data-table__card-label">Seats</dt>
            <dd className="data-table__card-value">{row.seats}</dd>
            <dt className="data-table__card-label">Joined</dt>
            <dd className="data-table__card-value">{row.joined}</dd>
          </dl>
        ),
      }}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// The package owns the sheet: prev/next navigation, the unsaved-changes guard,
// and returning focus to the row it was opened from. You supply the body.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  maxHeight={420}
  detail={{
    title: (row) => row.name,
    description: (row) => row.email,
    render: (row) => <MemberFields member={row} />,
  }}
/>
`.trim(),
      },
    },
  },
};

export const Cards: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <DataTable<Member>
        label="Team members"
        columns={columns}
        data={MEMBERS.slice(0, 6)}
        getRowId={(row) => row.id}
        selection="multiple"
        responsive={{ mode: "cards" }}
        maxHeight={520}
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `
// \`auto\` measures the container and swaps at the breakpoint. Selection and the
// detail sheet are table state, so they survive the swap in both directions.
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  selection="multiple"
  responsive={{ mode: "auto", breakpoint: 640 }}
  maxHeight={520}
/>
`.trim(),
      },
      description: {
        story:
          "Below the breakpoint the table is replaced by one card per row — not hidden with a container query, which would double the DOM and defeat virtualization.",
      },
    },
  },
};

export const Loading: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={[]}
      getRowId={(row) => row.id}
      loading
      maxHeight={420}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Skeleton rows are sized to the real row height, so nothing moves when the
// data lands. The header stays, which keeps the column widths stable too.
<DataTable
  label="Team members"
  columns={columns}
  data={[]}
  getRowId={(row) => row.id}
  loading
  maxHeight={420}
/>
`.trim(),
      },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={[]}
      getRowId={(row) => row.id}
      maxHeight={320}
      empty={{
        title: "No members yet",
        description: "Invite someone to see them listed here.",
        action: <Button size="sm">Invite a member</Button>,
      }}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// The empty state replaces the body, not the table — so the header, the
// filters and the scroll position all survive.
<DataTable
  label="Team members"
  columns={columns}
  data={[]}
  getRowId={(row) => row.id}
  maxHeight={320}
  empty={{
    title: "No members yet",
    description: "Invite someone to see them listed here.",
    action: <Button size="sm">Invite a member</Button>,
  }}
/>
`.trim(),
      },
    },
  },
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={[]}
      getRowId={(row) => row.id}
      maxHeight={320}
      error="The member list could not be loaded. Try again in a moment."
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Rendered with role="alert": the failure arrives after the user has moved on,
// so it has to announce itself.
<DataTable
  label="Team members"
  columns={columns}
  data={[]}
  getRowId={(row) => row.id}
  maxHeight={320}
  error="The member list could not be loaded. Try again in a moment."
/>
`.trim(),
      },
    },
  },
};

export const LargeDataset: Story = {
  name: "100,000 rows",
  render: () => (
    <DataTable<Member>
      label="Every member"
      columns={columns}
      data={MANY_MEMBERS}
      getRowId={(row) => row.id}
      selection="multiple"
      maxHeight={520}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// Nothing to switch on: rows virtualize above 50, and \`maxHeight\` is what
// gives the viewport something to scroll. Pass a stable \`data\` reference —
// a new array every render invalidates every row model, and the table warns
// about it in development.
<DataTable
  label="Every member"
  columns={columns}
  data={hundredThousandMembers}
  getRowId={(row) => row.id}
  selection="multiple"
  maxHeight={520}
/>
`.trim(),
      },
      description: {
        story:
          "Row virtualization above 50 rows. The DOM node count stays flat as you scroll, and `aria-rowindex` reports the real position in the dataset rather than the position in the rendered window.",
      },
    },
  },
};

/**
 * Server mode: the table stops sorting, filtering and paginating locally and
 * reports what the user asked for instead. This story fakes the server with a
 * synchronous slice of the same fixture, so the wiring is real even though the
 * latency is not.
 */
function ServerTable() {
  const [query, setQuery] = useState<DataTableQuery | null>(null);
  const pageSize = query?.pageSize ?? 10;

  const matching = useMemo(() => {
    const search = (query?.search ?? "").trim().toLowerCase();
    const filtered = search
      ? MEMBERS.filter((row) =>
          [row.name, row.email, row.role, row.team].some((field) =>
            field.toLowerCase().includes(search),
          ),
        )
      : MEMBERS;
    const [sort] = query?.sorting ?? [];
    if (!sort) return filtered;
    const key = sort.id as keyof Member;
    return [...filtered].sort(
      (a, b) => String(a[key]).localeCompare(String(b[key])) * (sort.desc ? -1 : 1),
    );
  }, [query]);

  const pageIndex = query?.pageIndex ?? 0;
  const page = useMemo(
    () => matching.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [matching, pageIndex, pageSize],
  );

  return (
    <DataTable<Member>
      label="Team members"
      columns={columns}
      data={page}
      getRowId={(row) => row.id}
      manual
      paginated
      pageSize={pageSize}
      rowCount={matching.length}
      onQueryChange={setQuery}
    />
  );
}

export const ServerMode: Story = {
  name: "Server mode",
  render: () => <ServerTable />,
  parameters: {
    docs: {
      source: {
        code: `
const [query, setQuery] = useState<DataTableQuery | null>(null);
const { rows, total } = useMembers(query);

// \`manual\` stops sorting, filtering and paginating locally: the table renders
// exactly the rows it is given and reports what the user asked for.
<DataTable
  label="Team members"
  columns={columns}
  data={rows}
  getRowId={(row) => row.id}
  manual
  paginated
  pageSize={10}
  // Required — the client cannot count rows it does not have. It is what the
  // pager and aria-rowcount report.
  rowCount={total}
  // \`filters\` is a flat list of { columnId, operator, values } conditions, so
  // JSON.stringify(query) is a valid cache key or URL parameter.
  onQueryChange={setQuery}
/>
`.trim(),
      },
      description: {
        story:
          "`manual` hands `{ sorting, filters, search, pageIndex, pageSize }` to `onQueryChange` and renders exactly the rows it is given. `rowCount` is required — the client cannot count rows it does not have, and it is what the pager and `aria-rowcount` report.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <DataTable<Member>
          key={size}
          label={`Team members (${size})`}
          captionVisible
          size={size}
          columns={columns.slice(0, 4)}
          data={MEMBERS.slice(0, 3)}
          getRowId={(row) => row.id}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `
// One size axis drives the row height and every control inside the table.
// \`captionVisible\` shows the accessible name instead of hiding it.
{(["sm", "md", "lg"] as const).map((size) => (
  <DataTable
    key={size}
    size={size}
    label={"Team members (" + size + ")"}
    captionVisible
    columns={columns}
    data={members}
    getRowId={(row) => row.id}
  />
))}
`.trim(),
      },
    },
  },
};

export const Bordered: Story = {
  render: () => (
    <DataTable<Member>
      label="Team members"
      variant="bordered"
      columns={columns.slice(0, 5)}
      data={MEMBERS.slice(0, 6)}
      getRowId={(row) => row.id}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `
// The emphasis axis. Per the repo's variant-xor-intent rule there is no
// \`intent\` prop on any table component.
<DataTable
  label="Team members"
  variant="bordered"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
/>
`.trim(),
      },
    },
  },
};
