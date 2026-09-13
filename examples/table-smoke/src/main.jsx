import { createRoot } from "react-dom/client";
import { DataTable } from "@ui-organized/react-table";
// The documented import order: tokens, then the component library's styles, then
// the table's. Three separate stylesheets, and the third is what this app exists
// to protect — it resolves through @ui-organized/react-table's `exports` map to a
// file that physically lives in @ui-organized/table-core's dist.
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "@ui-organized/react-table/styles";
// A real consumer registers exactly one icon set; the table's sort affordance is
// the only icon it renders.
import "@ui-organized/react/icons/lucide";

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

createRoot(document.getElementById("root")).render(
  <main>
    <DataTable
      label="Team members"
      columns={COLUMNS}
      data={ROWS}
      getRowId={(row) => row.id}
      selection="multiple"
    />
  </main>,
);
