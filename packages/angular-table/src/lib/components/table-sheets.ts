import {
  Component,
  Directive,
  Renderer2,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  viewChildren,
  type Signal,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  UioAccordion,
  UioButton,
  UioRadioGroup,
  UioSelect,
  UioSheet,
  UioSheetClose,
  UioSheetFooter,
  UioSheetTitle,
  UioSheetTrigger,
  type AccordionItem,
} from "@ui-organized/angular";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { injectDataTable } from "../core/table-context.js";
import { UioTableFilterValueEditor } from "./table-filters.js";

/**
 * Card mode's sort and filter controls: a labelled button that opens a bottom
 * sheet holding every control for that one concern.
 *
 * A menu anchored to a 36px icon is a desktop affordance. On a phone the menu
 * covers the cards it is sorting, and the filter chips wrap into a second
 * toolbar above a list that is already short of room. A sheet gives the
 * controls the full width and puts them within thumb reach, and the chips row
 * goes away: what is applied is counted on the button instead.
 *
 * ── Differences from React's markup, all forced ─────────────────────────────
 *
 * - `UioSheet` has no input for a class on its popup, so `data-table__sheet`
 *   is added to the popup element itself once the sheet has attached it
 *   (`addSheetPopupClass`). That is what lets the shared
 *   `.sheet__popup--bottom.data-table__sheet` rule size it to its content.
 * - There is no `TableSheetButton`: Angular's trigger is a directive on a real
 *   `<button>`, so the button cannot be wrapped in a component without putting
 *   a host element between `uioSheetTrigger` and the element it has to be on.
 *   The badge is written into each trigger instead — the count inside the
 *   label, spoken as words ("Filter, 2 applied"), because a bare "2" announced
 *   after "Filter" says nothing about what it counts.
 * - Contents render only while the sheet is open. `hideOthersFrom` marks every
 *   overlay surface that exists when a modal opens, and Angular attaches a
 *   menu's or select's surface when it is created; built at page load, the
 *   sheet's own selects would be painted but hidden from assistive tech.
 */

/**
 * Give the sheet's popup the table's class. The popup is attached in
 * `UioSheet.ngOnInit`, so by the time this effect runs it is in the document,
 * found by the id the dialog context gives its content part.
 */
function addSheetPopupClass(sheet: Signal<UioSheet | undefined>): void {
  const renderer = inject(Renderer2);
  const document = inject(DOCUMENT);
  effect(() => {
    const instance = sheet();
    if (!instance) return;
    const popup = document.getElementById(instance.dialogContext.partId("content"));
    if (popup) renderer.addClass(popup, "data-table__sheet");
  });
}

// ─── Sort ────────────────────────────────────────────────────────────────────

@Component({
  selector: "[uioTableSortSheet]",
  standalone: true,
  host: { style: "display: contents" },
  imports: [
    UioButton,
    UioRadioGroup,
    UioSheet,
    UioSheetClose,
    UioSheetFooter,
    UioSheetTitle,
    UioSheetTrigger,
  ],
  template: `
    @if (columns().length > 0) {
      <button
        uioButton
        uioSheetTrigger
        [sheet]="sheet"
        intent="secondary"
        [size]="table.size()"
        [icon]="icon()"
      >
        {{ label() }}
        @if (count() > 0) {
          <span class="data-table__badge" aria-hidden="true">{{ count() }}</span>
          <span class="data-table__sr-only">, {{ count() }} applied</span>
        }
      </button>
      <uio-sheet #sheet="uioSheet" side="bottom" size="lg">
        @if (sheet.open()) {
          <h2 uioSheetTitle>{{ label() }}</h2>
          <div class="data-table__sheet-body">
            <div
              uioRadioGroup
              label="Sort by"
              [options]="columnOptions()"
              [value]="activeId()"
              (valueChange)="chooseColumn($event)"
            ></div>
            <!--
              Disabled rather than hidden, as in the desktop menu: the sheet
              keeps its shape, so the second visit finds the controls where
              they were. Nothing is checked until there is a sort to have a
              direction: a pre-ticked "Ascending" over nothing reads as a sort
              that is applied.
            -->
            <div
              uioRadioGroup
              label="Direction"
              orientation="horizontal"
              [disabled]="!activeId()"
              [options]="DIRECTIONS"
              [value]="activeId() ? direction() : ''"
              (valueChange)="chooseDirection($event)"
            ></div>
          </div>
          <div uioSheetFooter>
            <button
              uioButton
              intent="ghost"
              size="lg"
              [disabled]="!activeId()"
              (click)="table.table.setSorting([])"
            >
              Clear sort
            </button>
            <button uioButton uioSheetClose intent="primary" size="lg">Done</button>
          </div>
        }
      </uio-sheet>
    }
  `,
})
export class UioTableSortSheet {
  /** Button label and sheet title. */
  readonly label = input("Sort");

  protected readonly table = injectDataTable();
  protected readonly DIRECTIONS = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  protected readonly columns = computed(() =>
    this.table.table.getAllLeafColumns().filter((column) => column.getCanSort()),
  );
  protected readonly columnOptions = computed(() =>
    this.columns().map((column) => {
      const header = column.columnDef.header;
      return { value: column.id, label: typeof header === "string" ? header : column.id };
    }),
  );
  private readonly sorting = computed(() => this.table.state().sorting ?? []);
  protected readonly count = computed(() => this.sorting().length);
  protected readonly activeId = computed(() => this.sorting()[0]?.id ?? "");
  protected readonly direction = computed(() => (this.sorting()[0]?.desc ? "desc" : "asc"));
  protected readonly icon = computed<CanonicalIconName>(() =>
    this.activeId() ? (this.sorting()[0]?.desc ? "sort-desc" : "sort-asc") : "sort",
  );

  private readonly sheet = viewChild(UioSheet);

  constructor() {
    addSheetPopupClass(this.sheet);
  }

  protected chooseColumn(id: string): void {
    this.table.table.setSorting([{ id, desc: this.direction() === "desc" }]);
  }
  protected chooseDirection(next: string): void {
    const id = this.activeId();
    if (id) this.table.table.setSorting([{ id, desc: next === "desc" }]);
  }
}

// ─── Filter ──────────────────────────────────────────────────────────────────

/**
 * One condition inside a field's section: its relation, its value, and a way
 * to clear it. The field is the section, so there is no field control.
 */
@Component({
  selector: "div[uioTableFilterSheetCondition]",
  standalone: true,
  imports: [UioButton, UioSelect, UioTableFilterValueEditor],
  host: {
    class: "data-table__sheet-filter",
    "[attr.data-filter-id]": "condition().id",
  },
  template: `
    <div
      uioSelect
      [size]="table.size()"
      label="Condition"
      [options]="operatorOptions()"
      [value]="condition().operator"
      (valueChange)="table.filters.update(condition().id, { operator: $event })"
    ></div>
    @if (arity() !== "none") {
      <div class="data-table__sheet-filter-value">
        <div uioTableFilterValueEditor [condition]="condition()" [arity]="arity()"></div>
      </div>
    }
    @if (description().complete) {
      <button
        uioButton
        intent="ghost"
        [size]="table.size()"
        icon="close"
        class="data-table__sheet-remove"
        [attr.aria-label]="'Clear filter: ' + description().text"
        (click)="table.filters.remove(condition().id)"
      >
        Clear {{ fieldLabel() }}
      </button>
    }
  `,
})
export class UioTableFilterSheetCondition {
  readonly condition = input.required<TableFilterCondition>();
  readonly fieldLabel = input.required<string>();

  protected readonly table = injectDataTable();
  protected readonly description = computed(() => this.table.filters.describe(this.condition()));
  protected readonly arity = computed(() => this.table.filters.arityOf(this.condition()));
  protected readonly operatorOptions = computed(() =>
    this.table.filters
      .operatorsFor(this.condition())
      .map((operator) => ({ value: operator.id, label: operator.label })),
  );
}

/**
 * Marks the template for one field's section, so the sheet can hand the
 * accordion one `TemplateRef` per field. `AccordionItem.content` takes a
 * template but passes it no context, so the field cannot be a template
 * variable; a view created from this template keeps the `@for` iteration it
 * was declared in, and with it the field.
 */
@Directive({ selector: "ng-template[uioTableSheetSection]", standalone: true })
export class UioTableSheetSection {
  readonly field = input<string>("", { alias: "uioTableSheetSection" });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Every filterable field at once, one accordion section each, so filtering on
 * a phone is "open the field, pick the value" rather than "add a filter,
 * choose its field, then pick the value".
 *
 * Each section edits a real condition. While the sheet is open every field has
 * at least one, so its editor has something to write to: the sheet adds an
 * empty draft for any field without one. A draft is an incomplete condition,
 * which the filter model keeps but never applies, so drafts change nothing
 * until they are given a value; the badge counts only complete conditions;
 * and closing the sheet removes the drafts nobody filled in.
 */
@Component({
  selector: "[uioTableFilterSheet]",
  standalone: true,
  host: { style: "display: contents" },
  imports: [
    UioAccordion,
    UioButton,
    UioSheet,
    UioSheetClose,
    UioSheetFooter,
    UioSheetTitle,
    UioSheetTrigger,
    UioTableFilterSheetCondition,
    UioTableSheetSection,
  ],
  template: `
    @if (fields().length > 0) {
      <button
        uioButton
        uioSheetTrigger
        [sheet]="sheet"
        intent="secondary"
        [size]="table.size()"
        icon="filter"
      >
        {{ label() }}
        @if (count() > 0) {
          <span class="data-table__badge" aria-hidden="true">{{ count() }}</span>
          <span class="data-table__sr-only">, {{ count() }} applied</span>
        }
      </button>
      <uio-sheet #sheet="uioSheet" side="bottom" size="lg" (openChange)="onOpenChange($event)">
        @if (sheet.open()) {
          <h2 uioSheetTitle>{{ label() }}</h2>
          <div class="data-table__sheet-body">
            @for (field of fields(); track field.columnId) {
              <ng-template [uioTableSheetSection]="field.columnId">
                <div class="data-table__sheet-section">
                  @for (condition of conditionsOf(field.columnId); track condition.id) {
                    <div
                      uioTableFilterSheetCondition
                      [condition]="condition"
                      [fieldLabel]="field.label"
                    ></div>
                  }
                </div>
              </ng-template>
            }
            <!--
              Every section starts collapsed, so the whole list of fields fits
              on screen at once; each header says what it applies, so nothing
              is hidden by being closed. Open one to edit it.
            -->
            <div
              uioAccordion
              multiple
              class="data-table__sheet-sections"
              [items]="sections()"
              [value]="expanded() ?? []"
              (valueChange)="expanded.set($event)"
            ></div>
          </div>
          <div uioSheetFooter>
            <button
              uioButton
              intent="ghost"
              size="lg"
              [disabled]="count() === 0"
              (click)="clearApplied()"
            >
              Clear all
            </button>
            <button uioButton uioSheetClose intent="primary" size="lg">Done</button>
          </div>
        }
      </uio-sheet>
    }
  `,
})
export class UioTableFilterSheet {
  /** Button label and sheet title. */
  readonly label = input("Filter");

  protected readonly table = injectDataTable();
  private readonly sheet = viewChild(UioSheet);
  private readonly sectionTemplates = viewChildren(UioTableSheetSection);

  protected readonly fields = computed(() => this.table.filters.fields());
  protected readonly allFields = computed(() => this.fields().map((field) => field.columnId));
  private readonly applied = computed(() =>
    this.table.filters
      .conditions()
      .filter((condition) => this.table.filters.describe(condition).complete),
  );
  protected readonly count = computed(() => this.applied().length);

  private readonly isOpen = signal(false);
  /** Sections the user has collapsed or expanded; null until they touch one. */
  protected readonly expanded = signal<readonly (string | number)[] | null>(null);

  /**
   * The accordion's items. The title is the field, and once something is
   * applied, what it is: "Role: is any of Admin". It has to be one string —
   * `AccordionItem.title` takes no template — so the summary rides in the
   * title rather than in a styled line of its own beneath it.
   */
  protected readonly sections = computed<AccordionItem[]>(() => {
    const templates = new Map(
      this.sectionTemplates().map((section) => [section.field(), section.template]),
    );
    return this.fields().map((field) => {
      const summary = this.conditionsOf(field.columnId)
        .map((condition) => this.table.filters.describe(condition))
        .filter((description) => description.complete)
        .map((description) => `${description.relative} ${description.value}`)
        .join("; ");
      return {
        value: field.columnId,
        title: summary ? `${field.label}: ${summary}` : field.label,
        content: templates.get(field.columnId),
      };
    });
  });

  constructor() {
    addSheetPopupClass(this.sheet);

    // Re-run on every change while open, not just on opening: "Clear" empties
    // a field, and that field then needs a fresh draft to keep its editor.
    const missing = computed(() =>
      this.isOpen()
        ? this.allFields()
            .filter(
              (columnId) =>
                !this.table.filters
                  .conditions()
                  .some((condition) => condition.columnId === columnId),
            )
            .join(",")
        : "",
    );
    effect(() => {
      const key = missing();
      if (!key) return;
      untracked(() => {
        for (const columnId of key.split(",")) this.table.filters.add(columnId);
        // `add` also marks the condition as being edited, which opens a chip's
        // popover in table mode. There are no chips here; undo it.
        this.table.filters.setEditing(null);
      });
    });
  }

  protected conditionsOf(columnId: string): TableFilterCondition[] {
    return this.table.filters.conditions().filter((condition) => condition.columnId === columnId);
  }

  protected onOpenChange(open: boolean): void {
    this.isOpen.set(open);
    if (open) return;
    this.expanded.set(null);
    // The drafts nobody filled in.
    for (const condition of this.table.filters.conditions()) {
      if (!this.table.filters.describe(condition).complete) this.table.filters.remove(condition.id);
    }
  }

  /** Only what is applied: the drafts stay, so every section keeps its editor. */
  protected clearApplied(): void {
    for (const condition of this.applied()) this.table.filters.remove(condition.id);
  }
}
