<script>
  import { DataTable } from "@ui-organized/svelte-table";

  /** Small enough that virtualization stays off — this gate is about the build. */
  const ROWS = [
    { id: "1", name: "Ada Lovelace", role: "Engineer", seats: 3 },
    { id: "2", name: "Grace Hopper", role: "Admin", seats: 1 },
    { id: "3", name: "Alan Turing", role: "Engineer", seats: 7 },
    { id: "4", name: "Katherine Johnson", role: "Analyst", seats: 2 },
  ];

  const COLUMNS = [
    { accessorKey: "name", header: "Name", meta: { primary: true } },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
  ];
</script>

<main>
  <DataTable
    label="Team members"
    columns={COLUMNS}
    data={ROWS}
    getRowId={(row) => row.id}
    selection="multiple"
  />
</main>
