import { Button } from "@ui-organized/react";
import { DataTable, type TableColumn } from "@ui-organized/react-table";
import type { UsageExampleSet } from "./types";

interface Member {
  id: string;
  name: string;
  role: string;
  team: string;
  email: string;
  status: string;
  seats: number;
  joined: string;
}

const MEMBERS: Member[] = [
  { id: "m1", name: "Ada Lovelace", role: "Owner", team: "Platform", email: "ada@example.com", status: "Active", seats: 12, joined: "2021-03-14" },
  { id: "m2", name: "Grace Hopper", role: "Admin", team: "Design", email: "grace@example.com", status: "Active", seats: 4, joined: "2022-07-01" },
  { id: "m3", name: "Alan Turing", role: "Editor", team: "Data", email: "alan@example.com", status: "Invited", seats: 108, joined: "2023-11-20" },
];

/** Chrome off: these examples are about the grid, and the card is 340px wide. */
const bare = {
  label: "Team members",
  data: MEMBERS,
  getRowId: (row: Member) => row.id,
  searchable: false,
  filterable: false,
  sortable: false,
  responsive: { mode: "table" as const },
  size: "sm" as const,
};

const name: TableColumn<Member> = { accessorKey: "name", header: "Name", meta: { primary: true, width: 130 } };

export const dataTableExamples: UsageExampleSet = {
  "align-numbers": {
    layout: "padded",
    Do: () => (
      <DataTable<Member>
        {...bare}
        columns={[name, { accessorKey: "seats", header: "Seats", meta: { align: "end", width: 80 } }]}
      />
    ),
    // 12, 4 and 108 start at the same edge, so their magnitudes don't line up.
    Dont: () => (
      <DataTable<Member>
        {...bare}
        columns={[name, { accessorKey: "seats", header: "Seats", meta: { width: 80 } }]}
      />
    ),
  },

  "few-columns": {
    layout: "padded",
    Do: () => (
      <DataTable<Member>
        {...bare}
        columns={[name, { accessorKey: "role", header: "Role", meta: { width: 90 } }]}
      />
    ),
    // Seven columns in a narrow frame: the role, the one field that matters, scrolls away.
    Dont: () => (
      <DataTable<Member>
        {...bare}
        columns={[
          name,
          { accessorKey: "email", header: "Email", meta: { width: 170 } },
          { accessorKey: "team", header: "Team", meta: { width: 100 } },
          { accessorKey: "joined", header: "Joined", meta: { width: 110 } },
          { accessorKey: "seats", header: "Seats", meta: { align: "end", width: 80 } },
          { accessorKey: "status", header: "Status", meta: { width: 100 } },
          { accessorKey: "role", header: "Role", meta: { width: 90 } },
        ]}
      />
    ),
  },

  "empty-state": {
    layout: "padded",
    Do: () => (
      <DataTable<Member>
        {...bare}
        data={[]}
        columns={[name, { accessorKey: "role", header: "Role", meta: { width: 90 } }]}
        empty={{
          title: "No members yet",
          description: "Invite people to share this workspace.",
          action: <Button size="sm">Invite a member</Button>,
        }}
      />
    ),
    // The default title: it can't say whether the table is new or over-filtered.
    Dont: () => (
      <DataTable<Member>
        {...bare}
        data={[]}
        columns={[name, { accessorKey: "role", header: "Role", meta: { width: 90 } }]}
      />
    ),
  },
};
