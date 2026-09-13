// `@angular/compiler` for its side effect: it installs the JIT compiler, which
// is what lets a `@Component` decorator become a real component without the
// Angular CLI. A consumer using `ng build` gets AOT and does not need this — the
// gate is about `exports`, `sideEffects` and the stylesheet, not about which
// compiler ran.
import "@angular/compiler";
import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { UioDataTable, type TableColumn } from "@ui-organized/angular-table";
import { registerIconSet } from "@ui-organized/angular";
import { lucideIcons } from "@ui-organized/angular/icons/lucide";
// The documented import order: tokens, the CDK's overlay sheet, then the
// component library's two stylesheets, then the table's. The last is what this
// app exists to protect — it resolves through @ui-organized/angular-table's
// `exports` map to a copy of a file that physically lives in
// @ui-organized/table-core's dist.
import "@ui-organized/tokens/variables.css";
import "@angular/cdk/overlay-prebuilt.css";
import "@ui-organized/angular/styles.css";
import "@ui-organized/angular/overlay.css";
import "@ui-organized/angular-table/styles";

registerIconSet(lucideIcons);

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

@Component({
  selector: "app-root",
  standalone: true,
  imports: [UioDataTable],
  template: `
    <main>
      <div
        uioDataTable
        label="Team members"
        [columns]="columns"
        [data]="rows()"
        [getRowId]="rowId"
        selection="multiple"
      ></div>
    </main>
  `,
})
export class AppComponent {
  protected readonly rows = signal(ROWS);
  protected readonly columns = COLUMNS;
  protected readonly rowId = (row: Member) => row.id;
}

void bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] });
