import { Component } from "@angular/core";
import { UioButton, UioCard, UioIcon, UioInput } from "@ui-organized/angular";
import { UioDataTable, type TableColumn } from "@ui-organized/angular-table";

interface Member {
  id: string;
  name: string;
  role: string;
  seats: number;
}

/** Small enough that virtualization stays off — this gate is about the build. */
const ROWS: Member[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", seats: 3 },
  { id: "2", name: "Grace Hopper", role: "Admin", seats: 1 },
  { id: "3", name: "Alan Turing", role: "Engineer", seats: 7 },
  { id: "4", name: "Katherine Johnson", role: "Analyst", seats: 2 },
];

const COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

/**
 * Get Started's App, its icon examples and the data table, in the file
 * `ng new` generates. Not copied verbatim like main.ts: `ng build` compiles
 * this template ahead of time with `strictTemplates`, which holds the inputs the
 * docs show to the library's real ones.
 */
@Component({
  selector: "app-root",
  imports: [UioButton, UioCard, UioIcon, UioInput, UioDataTable],
  template: `
    <div uioCard>
      <div uioInput label="Email" placeholder="you@example.com"></div>
      <button uioButton intent="primary">Save</button>
    </div>

    <span uioIcon name="trash-2" [size]="16" label="Delete project"></span>
    <button uioButton icon="refresh-cw">Reload</button>

    <main>
      <div
        uioDataTable
        label="Team members"
        [columns]="columns"
        [data]="rows"
        [getRowId]="rowId"
        selection="multiple"
      ></div>
    </main>
  `,
})
export class App {
  protected readonly rows = ROWS;
  protected readonly columns = COLUMNS;
  protected readonly rowId = (row: Member) => row.id;
}
