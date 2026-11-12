import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  Component,
  TemplateRef,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import type { UioAlertDialog, UioSheet } from "@ui-organized/angular";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import { UioTableDetailSheet } from "./components/table-detail-sheet.js";
import type { DataTableApi, DetailConfig, TableColumn, UseDataTableOptions } from "./core/types.js";

/**
 * The row detail panel: what it shows, where focus goes, and the dirty guard.
 * Mirrors React's `TableDetailSheet` in `@ui-organized/react-table`.
 *
 * Opened through the api rather than by clicking a row, for the reason
 * `selection-bar.spec.ts` gives: the body's parts cannot mount under JIT. The
 * click that opens it is core's, and `opener` stands in for the row it would
 * have focused.
 */

interface Row {
  id: string;
  name: string;
  role: string;
}

const DATA: Row[] = [
  { id: "1", name: "Ada", role: "Engineer" },
  { id: "2", name: "Grace", role: "Admiral" },
  { id: "3", name: "Alan", role: "Engineer" },
];

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "role", header: "Role" },
];

let api: DataTableApi<Row>;

@Component({
  standalone: true,
  imports: [UioTableDetailSheet],
  providers: [{ provide: UIO_DATA_TABLE, useFactory: () => api }],
  template: `
    <button id="opener">Ada</button>
    <div uioTableDetailSheet></div>
    <ng-template #body let-row
      ><span class="probe">{{ row.role }}</span></ng-template
    >
  `,
})
class Host {
  @ViewChild("body", { static: true }) body!: TemplateRef<unknown>;
}

function mount(detail: (host: () => Host) => DetailConfig<Row>) {
  let host!: Host;
  const options: UseDataTableOptions<Row> = {
    label: "Team",
    columns: COLUMNS,
    data: DATA,
    getRowId: (row: Row) => row.id,
    detail: detail(() => host),
  };
  api = TestBed.runInInjectionContext(() => createDataTable<Row>(() => options));
  const fixture = TestBed.createComponent(Host);
  host = fixture.componentInstance;

  // `controlled` is an initializer-based input, and JIT registers none of
  // those, so the attribute the template writes is replaced here. The parity
  // harness covers real binding, against the built package.
  const part = fixture.debugElement.query(By.directive(UioTableDetailSheet))
    .componentInstance as unknown as { sheet: UioSheet; alert: UioAlertDialog };
  for (const overlay of [part.sheet, part.alert]) {
    (overlay as unknown as Record<string, unknown>)["controlled"] = signal(true);
  }
  fixture.detectChanges();

  const opener = fixture.nativeElement.querySelector("#opener") as HTMLButtonElement;
  const sheet = () =>
    document.querySelector<HTMLElement>('.cdk-overlay-container [role="dialog"]')!;
  const alert = () =>
    document.querySelector<HTMLElement>('.cdk-overlay-container [role="alertdialog"]')!;
  const settle = () => {
    TestBed.tick();
    fixture.detectChanges();
  };
  const open = (rowId: string) => {
    opener.focus();
    api.detail.open(rowId);
    settle();
  };
  const escape = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    settle();
  };
  const press = (surface: HTMLElement, selector: string) => {
    surface.querySelector<HTMLElement>(selector)!.click();
    settle();
  };
  return { fixture, opener, sheet, alert, open, escape, press, settle };
}

const BASIC = (): DetailConfig<Row> => ({
  title: (row) => row.name,
  description: (row) => row.role,
  render: (row) => `Profile of ${row.name}`,
  footer: () => "Footer actions",
});

describe("UioTableDetailSheet", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("renders nothing in flow, and nothing at all until a row is opened", () => {
    const { fixture, sheet } = mount(BASIC);
    // React's part is a portalled Sheet and AlertDialog and no element of its own.
    expect(fixture.nativeElement.querySelector("[uiotabledetailsheet]")).toBeNull();
    expect(sheet().getAttribute("data-state")).toBe("closed");
    expect(sheet().querySelector(".data-table__detail-header")).toBeNull();
    fixture.destroy();
  });

  it("shows the row: title, description, body, footer and its place in the page", () => {
    const { fixture, sheet, open } = mount(BASIC);
    open("1");
    const panel = sheet();
    expect(panel.getAttribute("data-state")).toBe("open");
    expect(panel.classList).toContain("data-table__detail");
    expect(panel.querySelector(".dialog__title")!.textContent!.trim()).toBe("Ada");
    expect(panel.querySelector(".dialog__description")!.textContent!.trim()).toBe("Engineer");
    expect(panel.querySelector(".data-table__detail-body")!.textContent!.trim()).toBe(
      "Profile of Ada",
    );
    expect(panel.querySelector(".sheet__footer")!.textContent!.trim()).toBe("Footer actions");
    expect(panel.querySelector(".data-table__detail-position")!.textContent!.trim()).toBe("1 of 3");
    fixture.destroy();
  });

  it("titles the panel with the table's label when no title is given", () => {
    const { fixture, sheet, open } = mount(() => ({ render: () => "Body" }));
    open("2");
    expect(sheet().querySelector(".dialog__title")!.textContent!.trim()).toBe("Team");
    expect(sheet().querySelector(".dialog__description")).toBeNull();
    expect(sheet().querySelector(".sheet__footer")).toBeNull();
    fixture.destroy();
  });

  it("renders a template body with the row as its implicit context", () => {
    const { fixture, sheet, open } = mount((host) => ({ render: () => host().body }));
    open("2");
    expect(sheet().querySelector(".probe")!.textContent).toBe("Admiral");
    fixture.destroy();
  });

  it("steps between rows, and cannot step past either end", () => {
    const { fixture, sheet, open, press } = mount(BASIC);
    open("1");
    const prev = () => sheet().querySelector<HTMLButtonElement>('[aria-label="Previous row"]')!;
    const next = () => sheet().querySelector<HTMLButtonElement>('[aria-label="Next row"]')!;
    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(false);

    press(sheet(), '[aria-label="Next row"]');
    press(sheet(), '[aria-label="Next row"]');
    expect(sheet().querySelector(".dialog__title")!.textContent!.trim()).toBe("Alan");
    expect(sheet().querySelector(".data-table__detail-position")!.textContent!.trim()).toBe(
      "3 of 3",
    );
    expect(next().disabled).toBe(true);
    expect(prev().disabled).toBe(false);
    fixture.destroy();
  });

  it("closes from its ×, and gives focus back to the row it was opened from", () => {
    const { fixture, opener, sheet, open, press } = mount(BASIC);
    open("1");
    expect(sheet().contains(document.activeElement)).toBe(true);

    press(sheet(), ".dialog__close");
    expect(api.detail.state().rowId).toBeNull();
    expect(sheet().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
  });

  it("asks before discarding edits, and stays open underneath the question", () => {
    const { fixture, opener, sheet, alert, open, escape, press } = mount(BASIC);
    open("1");
    api.detail.setDirty(true);

    escape();
    expect(alert().getAttribute("data-state")).toBe("open");
    // The point of making the sheet controlled: it did not close itself.
    expect(sheet().getAttribute("data-state")).toBe("open");
    expect(api.detail.state().rowId).toBe("1");

    press(alert(), "[uioAlertDialogCancel]");
    expect(alert().getAttribute("data-state")).toBe("closed");
    expect(sheet().getAttribute("data-state")).toBe("open");
    expect(sheet().contains(document.activeElement)).toBe(true);

    escape();
    expect(alert().getAttribute("data-state")).toBe("open");
    // Not lost to the alert's own listener, which runs before this one.
    press(alert(), "[uioAlertDialogConfirm]");
    expect(alert().getAttribute("data-state")).toBe("closed");
    expect(sheet().getAttribute("data-state")).toBe("closed");
    expect(api.detail.state().rowId).toBeNull();
    expect(document.activeElement).toBe(opener);
    fixture.destroy();
  });

  it("asks before stepping away from edits, and steps on Discard", () => {
    const { fixture, sheet, alert, open, press } = mount(BASIC);
    open("1");
    api.detail.setDirty(true);

    press(sheet(), '[aria-label="Next row"]');
    expect(alert().getAttribute("data-state")).toBe("open");
    expect(sheet().querySelector(".dialog__title")!.textContent!.trim()).toBe("Ada");

    press(alert(), "[uioAlertDialogConfirm]");
    expect(alert().getAttribute("data-state")).toBe("closed");
    expect(sheet().getAttribute("data-state")).toBe("open");
    expect(sheet().querySelector(".dialog__title")!.textContent!.trim()).toBe("Grace");
    fixture.destroy();
  });
});
