import { useState } from "react";
import { DataTable } from "@ui-organized/react-table";
import { PartSlot } from "./DashboardPage";
import { MEMBERS, MEMBER_COLUMNS, type Member } from "./showcaseData";

let invited = 0;

function newMember(): Member {
  invited += 1;
  return {
    id: `invite-${invited}`,
    name: `New member ${invited}`,
    email: `new.${invited}@example.com`,
    role: "Engineer",
    team: "Platform",
    status: "invited",
    seats: 1,
    joined: "2026-11-04",
    location: "London",
    plan: "Free",
    lastActive: "2026-11-04",
  };
}

/** The mockup's Table page: layout only. The table is a part (parts.tsx),
 * mounted once and docked here, so its state survives the hero's physics. */
export function TablePage() {
  return (
    <div className="showcase-table">
      <PartSlot id="table" fill />
    </div>
  );
}

/**
 * The table on the mockup's Table page: one `DataTable` with every feature the package has
 * switched on — search, sort menu, filters, pagination, multi-select with bulk
 * actions, row actions, header actions, export, column resize / reorder /
 * visibility, a pinned primary column, inline editing (Seats) and the row
 * detail sheet. The actions mutate local state so they visibly do something.
 * `TABLE_SPEC` in showcaseSpecs.ts is the Code view of this page.
 */
export function TableContent() {
  const [rows, setRows] = useState(MEMBERS);

  const remove = (ids: Set<string>) => setRows((prev) => prev.filter((row) => !ids.has(row.id)));

  return (
    <DataTable<Member>
      label="Team members"
      columns={MEMBER_COLUMNS}
      data={rows}
      getRowId={(row) => row.id}
      selection="multiple"
      searchable
      sortMenu
      paginated
      resizable
      reorderable
      hideableColumns
      exportable
      defaultSorting={[{ id: "name", desc: false }]}
      actions={[
        { id: "import", label: "Import", intent: "secondary", onRun: () => {} },
        {
          id: "invite",
          label: "Invite member",
          intent: "primary",
          icon: "plus",
          onRun: () => setRows((prev) => [newMember(), ...prev]),
        },
      ]}
      rowActions={[
        { id: "edit", label: "Edit member", icon: "pencil", onRun: () => {} },
        {
          id: "remove",
          label: "Remove",
          icon: "trash-2",
          destructive: true,
          disabled: (row) => row.role === "Owner",
          onRun: (row) => remove(new Set([row.id])),
        },
      ]}
      bulkActions={[
        { id: "export", label: "Export", icon: "download", onRun: () => {} },
        {
          id: "archive",
          label: "Archive",
          icon: "trash-2",
          destructive: true,
          onRun: (selected) => remove(new Set(selected.map((row) => row.id))),
        },
      ]}
      onEdit={({ rowId, value }) =>
        setRows((prev) =>
          prev.map((row) => (row.id === rowId ? { ...row, seats: Number(value) } : row)),
        )
      }
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
  );
}
