import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import {
  UioButton,
  UioChip,
  UioDateInput,
  UioDivider,
  UioInput,
  UioListbox,
  UioMenu,
  UioMenuItem,
  UioMenuTrigger,
  UioNumberField,
  UioPopover,
  UioPopoverTitle,
  UioSearchInput,
  UioSegmentedControl,
  UioSelect,
} from "@ui-organized/angular";
import type { ComparisonIconName } from "@ui-organized/angular";
import {
  searchOptions,
  type FilterOperatorArity,
  type TableFilterCondition,
  type TableFilterValue,
} from "@ui-organized/table-core";
import { HostPresence } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";

/** Options above this many get a search box — the article's "search in the panel". */
const SEARCHABLE_ABOVE = 8;

/**
 * Focus has to land somewhere deliberate when a chip disappears, or it falls to
 * `<body>` and a keyboard user loses their place entirely.
 */
export function focusAfterRemoval(removedId: string): void {
  if (typeof requestAnimationFrame !== "function") return;
  requestAnimationFrame(() => {
    const bar = document.querySelector(".data-table__filters");
    if (!bar) return;
    const triggers = [...bar.querySelectorAll<HTMLElement>("[data-filter-id]")];
    const next = triggers.find((element) => element.dataset["filterId"] !== removedId);
    (next ?? bar.querySelector<HTMLElement>("button"))?.focus();
  });
}

/**
 * The value half of a condition editor.
 *
 * Which control appears follows from **type and operator together**, never from
 * the type alone — that is the whole point of separating the two. A date column
 * shows one date field for "is before", two for "is between", and a number plus
 * a unit for "is in the last".
 */
@Component({
  selector: "[uioTableFilterValueEditor]",
  standalone: true,
  imports: [
    UioDateInput,
    UioInput,
    UioListbox,
    UioNumberField,
    UioSearchInput,
    UioSegmentedControl,
    UioSelect,
  ],
  template: `
    @switch (kind()) {
      @case ("none") {
        <!-- "is empty" and "is today" take nothing, so there is nothing to render. -->
      }
      @case ("boolean") {
        <div
          uioSegmentedControl
          [size]="table.size()"
          ariaLabel="Value"
          [items]="BOOLEAN_ITEMS"
          [value]="booleanValue()"
          (valueChange)="setBoolean($event)"
        ></div>
      }
      @case ("enum") {
        @if (searchable()) {
          <div
            uioSearchInput
            [size]="table.size()"
            ariaLabel="Search values"
            [value]="query()"
            (valueChange)="query.set($event)"
          ></div>
        }
        <!--
          "label", not "ariaLabel": Listbox has a closed prop API, so a bare
          aria-label is silently dropped and the listbox ships unnamed — an
          aria-input-field-name violation that only shows up with the popover
          open, which the story-level axe gate never sees.
        -->
        <div
          uioListbox
          class="data-table__filter-field data-table__filter-field--unlabelled"
          [size]="table.size()"
          [selectionMode]="arity() === 'many' ? 'multiple' : 'single'"
          label="Value"
          [options]="listboxOptions()"
          [value]="selectedValues()"
          emptyMessage="No matching values"
          (valueChange)="setSelected($event)"
        ></div>
      }
      @case ("relative-date") {
        <div class="data-table__filter-editor-value">
          <div
            uioNumberField
            [size]="table.size()"
            label="Amount"
            [min]="1"
            [value]="numberAt(0)"
            (valueChange)="setAt(0, $event)"
          ></div>
          <div
            uioSelect
            [size]="table.size()"
            label="Unit"
            [value]="condition().unit ?? 'day'"
            [options]="UNITS"
            (valueChange)="setUnit($event)"
          ></div>
        </div>
      }
      @case ("date") {
        <div class="data-table__filter-editor-value">
          <div
            uioDateInput
            class="data-table__filter-field"
            [size]="table.size()"
            [label]="arity() === 'two' ? 'From' : 'Date'"
            [value]="stringAt(0)"
            (valueChange)="setAt(0, $event || null)"
          ></div>
          @if (arity() === "two") {
            <div
              uioDateInput
              [size]="table.size()"
              label="To"
              [value]="stringAt(1)"
              (valueChange)="setAt(1, $event || null)"
            ></div>
          }
        </div>
      }
      @case ("number") {
        <div class="data-table__filter-editor-value">
          <div
            uioNumberField
            class="data-table__filter-field"
            [size]="table.size()"
            [label]="arity() === 'two' ? 'Minimum' : 'Value'"
            [value]="numberAt(0)"
            (valueChange)="setAt(0, $event)"
          ></div>
          @if (arity() === "two") {
            <div
              uioNumberField
              [size]="table.size()"
              label="Maximum"
              [value]="numberAt(1)"
              (valueChange)="setAt(1, $event)"
            ></div>
          }
        </div>
      }
      @default {
        <div
          uioInput
          class="data-table__filter-field data-table__filter-field--unlabelled"
          [size]="table.size()"
          label="Value"
          placeholder="Data"
          [value]="stringAt(0)"
          (valueChange)="setAt(0, $event)"
        ></div>
      }
    }
  `,
})
export class UioTableFilterValueEditor {
  readonly condition = input.required<TableFilterCondition>();
  readonly arity = input.required<FilterOperatorArity>();

  protected readonly table = injectDataTable();
  protected readonly query = signal("");

  protected readonly BOOLEAN_ITEMS = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];
  protected readonly UNITS = [
    { value: "day", label: "days" },
    { value: "week", label: "weeks" },
    { value: "month", label: "months" },
    { value: "year", label: "years" },
  ];

  private readonly type = computed(() => this.table.filters.typeOf(this.condition()));

  /** One switch value rather than nested conditions, which a template cannot nest. */
  protected readonly kind = computed(() => {
    if (this.arity() === "none") return "none";
    const type = this.type();
    if (type === "date") {
      const operator = this.condition().operator;
      return operator === "in-last" || operator === "in-next" ? "relative-date" : "date";
    }
    return type;
  });

  private readonly options = computed(() => this.table.filters.optionsFor(this.condition()));
  protected readonly searchable = computed(() => this.options().length > SEARCHABLE_ABOVE);
  protected readonly listboxOptions = computed(() =>
    // The count rides in the label because `ListboxOption.label` is a string —
    // which is also exactly what a screen reader reads out.
    searchOptions(this.options(), this.query()).map((option) => ({
      value: option.value,
      label: option.count > 0 ? `${option.label} · ${option.count}` : option.label,
      disabled: option.disabled,
    })),
  );
  protected readonly selectedValues = computed(() => this.condition().values.map(String));
  protected readonly booleanValue = computed(() => {
    const first = this.condition().values[0];
    return first === null || first === undefined ? undefined : String(first);
  });

  protected numberAt(index: number): number | null {
    const value = this.condition().values[index];
    return typeof value === "number" ? value : null;
  }
  protected stringAt(index: number): string {
    return String(this.condition().values[index] ?? "");
  }

  private set(values: TableFilterValue[]): void {
    this.table.filters.update(this.condition().id, { values });
  }
  protected setAt(index: number, value: TableFilterValue): void {
    const values = [...this.condition().values];
    while (values.length <= index) values.push(null);
    values[index] = value;
    this.set(values);
  }
  protected setBoolean(value: string): void {
    this.set([value === "true"]);
  }
  protected setSelected(values: string[]): void {
    this.set(this.arity() === "many" ? values : values.slice(0, 1));
  }
  protected setUnit(unit: string): void {
    this.table.filters.update(this.condition().id, {
      unit: unit as "day" | "week" | "month" | "year",
    });
  }
}

/**
 * One condition's editor (Figma 2298:726): the field name, the operator, the
 * value, then a rule and a remove.
 */
@Component({
  selector: "[uioTableFilterEditor]",
  standalone: true,
  imports: [UioButton, UioDivider, UioSelect, UioTableFilterValueEditor],
  template: `
    <div
      uioSelect
      class="data-table__filter-field data-table__filter-field--unlabelled"
      [size]="table.size()"
      label="Condition"
      [value]="condition().operator"
      [options]="operatorOptions()"
      (valueChange)="setOperator($event)"
    ></div>

    <ng-container uioTableFilterValueEditor [condition]="condition()" [arity]="arity()" />

    <div uioDivider class="data-table__filter-editor-rule"></div>

    <button
      uioButton
      intent="ghost"
      [size]="table.size()"
      icon="trash"
      class="data-table__filter-editor-remove"
      (click)="remove()"
    >
      Remove
    </button>
  `,
})
export class UioTableFilterEditor {
  readonly condition = input.required<TableFilterCondition>();

  protected readonly table = injectDataTable();
  protected readonly arity = computed(() => this.table.filters.arityOf(this.condition()));
  protected readonly operatorOptions = computed(() =>
    this.table.filters
      .operatorsFor(this.condition())
      .map((operator) => ({ value: operator.id, label: operator.label })),
  );

  protected setOperator(operator: string): void {
    this.table.filters.update(this.condition().id, { operator });
  }

  protected remove(): void {
    const id = this.condition().id;
    this.table.filters.remove(id);
    focusAfterRemoval(id);
  }
}

/**
 * One condition, as a chip that opens its own editor (Figma 2298:376).
 *
 * No dismiss button on the chip itself: removal lives inside the editor, where
 * the design puts it. That keeps the chip a single target the whole width of the
 * words it shows — a 20px-tall pill with a second 20px hit area inside it is a
 * coin-flip on touch.
 */
@Component({
  selector: "[uioTableFilterChip]",
  standalone: true,
  imports: [UioChip, UioPopover, UioPopoverTitle, UioTableFilterEditor],
  template: `
    <!--
      React, Svelte and Vue put the popover *trigger* on the Chip itself: their
      Chip forwards its rest props to the body button, so the trigger's id,
      aria-expanded and click handler land on the button that opens the popover.

      Angular's "UioChip" owns that button — it renders one internally, because a
      dismiss button beside a clickable body cannot be nested inside it — so a
      "button[uioPopoverTrigger]" cannot be put on the chip from outside. The
      chip therefore *asks* to open through its own "activate" output, the
      popover is controlled by filter state (which it already was, in all four),
      and the surface is anchored to the chip's host element.
    -->
    <span
      #chip
      uioChip
      class="data-table__filter-chip"
      [label]="description().field"
      [operator]="operatorIcon()"
      [operatorLabel]="description().relative"
      [detail]="description().relative"
      [selected]="open()"
      [incomplete]="!description().complete"
      [attr.data-column-id]="condition().columnId"
      [attr.data-filter-id]="condition().id"
      (activate)="setOpen(!open())"
    >
      {{ description().value }}
    </span>
    <uio-popover
      #popover="uioPopover"
      class="data-table__filter-editor-popup"
      side="bottom"
      align="start"
      [open]="open()"
      (openChange)="setOpen($event)"
      (keydown)="onKeyDown($event)"
    >
      <div #editor class="data-table__filter-editor">
        <h2 uioPopoverTitle class="data-table__filter-editor-title">
          {{ description().field }}
        </h2>
        <ng-container uioTableFilterEditor [condition]="condition()" />
      </div>
    </uio-popover>
  `,
})
export class UioTableFilterChip {
  readonly condition = input.required<TableFilterCondition>();

  protected readonly table = injectDataTable();
  private readonly editor = viewChild<ElementRef<HTMLElement>>("editor");
  private readonly chip = viewChild<ElementRef<HTMLElement>>("chip");
  private readonly popover = viewChild<UioPopover>("popover");

  // Which chip is open is filter state, not chip state: the chip that opens is
  // often the one the *header* just created, and removing an open condition has
  // to close its editor rather than leave a dangling id behind.
  protected readonly open = computed(() => this.table.filters.editing() === this.condition().id);
  protected readonly description = computed(() => this.table.filters.describe(this.condition()));
  protected readonly operatorIcon = computed(
    () => this.description().icon as ComparisonIconName | undefined,
  );

  // The condition as it was when the editor opened, so Escape can revert it.
  private snapshot: TableFilterCondition | null = null;

  constructor() {
    // What `uioPopoverTrigger` does in its own `ngOnInit`: without an opener the
    // surface anchors to `document.body` and the editor opens in the corner.
    effect(() => {
      const chip = this.chip()?.nativeElement;
      const popover = this.popover();
      if (chip && popover) popover.rememberOpener(chip);
    });

    effect(() => {
      // Only when the editor opens — capturing on every change would defeat it.
      if (this.open()) this.snapshot = this.condition();
    });

    /**
     * Put focus in the first typeable field once the popover opens.
     *
     * **Two** frames, not one. A focus trace in the React adapter showed this
     * landing correctly and then the operator `Select` taking focus a
     * millisecond later, because it is the first focusable child. Waiting a
     * second frame puts this last, which is the only thing that sticks — and it
     * is the overlay's behaviour, not React's, so it is the same here.
     *
     * Deliberately only an `<input>`: a text, number, date or search field is
     * something you type into immediately. An enum list without a search box has
     * nothing to type into, so its focus is left where the overlay put it.
     */
    effect((onCleanup) => {
      const host = this.editor()?.nativeElement;
      if (!this.open() || !host || typeof requestAnimationFrame !== "function") return;
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          const field = host.querySelector<HTMLInputElement>(
            'input:not([type="hidden"]):not([disabled])',
          );
          field?.focus();
          field?.select();
        });
      });
      onCleanup(() => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      });
    });
  }

  protected setOpen(next: boolean): void {
    this.table.filters.setEditing(next ? this.condition().id : null);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || !this.snapshot) return;
    // The overlay closes on Escape anyway; this puts the value back first, so
    // Escape abandons the edit rather than committing it.
    this.table.filters.restore(this.snapshot);
  }
}

/**
 * The field picker, in both the shapes the design uses it: the header's
 * icon-only button (Figma 2298:336) and the filter bar's "＋ Add" (2298:531).
 *
 * A `Menu`, like every other menu the table puts in its chrome. Picking a field
 * *does* something — it adds a filter and opens that filter's editor — so
 * `role="menu"` with `menuitem` children is the honest semantic.
 */
@Component({
  selector: "[uioTableFilterAdd]",
  standalone: true,
  imports: [UioButton, UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    @if (fields().length > 0) {
      <!--
        aria-label on the trigger also names the menu it opens: the machine
        points the menu's aria-labelledby at its trigger, which wins over any
        aria-label on the content. So the button's name has to be the menu's
        name too — "Add filter", not "Filter".
      -->
      @if (iconOnly()) {
        <button
          uioButton
          uioMenuTrigger
          [menu]="menu"
          intent="secondary"
          [size]="table.size()"
          icon="filter"
          [attr.aria-label]="label()"
        ></button>
      } @else {
        <button uioButton uioMenuTrigger [menu]="menu" intent="ghost" size="sm" icon="plus">
          {{ label() }}
        </button>
      }
      <uio-menu #menu="uioMenu" align="end" class="data-table__filter-picker">
        <!--
          A field that already carries conditions stays in the list — several
          conditions on one column is the point — with a count so it is obvious
          this adds another rather than replacing.
        -->
        @for (field of fields(); track field.columnId) {
          <div uioMenuItem [value]="field.columnId" (select)="table.filters.add(field.columnId)">
            {{ field.count > 0 ? field.label + " (" + field.count + ")" : field.label }}
          </div>
        }
      </uio-menu>
    }
  `,
})
export class UioTableFilterAdd {
  readonly label = input("Add filter");
  readonly iconOnly = input(false);

  protected readonly table = injectDataTable();
  protected readonly fields = computed(() => this.table.filters.fields());
}

/**
 * The applied filters, on their own line under the header (Figma 2298:362).
 *
 * A *summary*, not a control panel: the filter button lives in the header above,
 * and this line does not exist until the user has actually filtered something. A
 * bar that is always present and usually empty is chrome that teaches people to
 * stop looking at it.
 */
@Component({
  selector: "div[uioTableFilters]",
  standalone: true,
  providers: [HostPresence],
  imports: [UioButton, UioMenu, UioMenuTrigger, UioMenuItem, UioTableFilterChip],
  host: { class: "data-table__filters", role: "group", "aria-label": "Filters" },
  template: `
    <!--
      role=group, not role=toolbar: toolbar promises arrow-key navigation between
      its controls, and until that lands the promise would be a lie to assistive
      tech.
    -->
    @if (render()) {
      <span class="data-table__filters-label">Filters</span>

      @for (condition of conditions(); track condition.id) {
        <ng-container uioTableFilterChip [condition]="condition" />
      }

      <!--
        aria-label on the trigger also names the menu it opens: the machine
        points the menu's aria-labelledby at its trigger, which wins over any
        aria-label on the content. So the button's name has to be the menu's name
        too — "Add filter", not "Filter".

        A field that already carries conditions stays in the list — several
        conditions on one column is the point — with a count so it is obvious
        this adds another rather than replacing.
      -->
      <button uioButton uioMenuTrigger [menu]="addSurface" intent="ghost" size="sm" icon="plus">
        Add
      </button>
      <uio-menu #addSurface="uioMenu" align="end" class="data-table__filter-picker">
        @for (field of filterFields(); track field.columnId) {
          <div uioMenuItem [value]="field.columnId" (select)="table.filters.add(field.columnId)">
            {{ field.count > 0 ? field.label + " (" + field.count + ")" : field.label }}
          </div>
        }
      </uio-menu>

      <button uioButton intent="ghost" size="sm" icon="rotate-ccw" (click)="table.filters.clear()">
        Reset
      </button>

      <!--
          One polite region for add / remove / change / clear. Deliberately not a
          visible count: that changes on every keystroke elsewhere, and a live
          region that re-announces per keystroke is a firehose.
        -->
      <span class="data-table__sr-only" role="status" aria-live="polite">
        {{ table.filters.announcement() }}
      </span>
    }
  `,
})
export class UioTableFilters {
  private readonly presence = inject(HostPresence);

  constructor() {
    // A bar that renders nothing must not hold a row of layout: React
    // returns null, and an Angular host element cannot — so it takes
    // itself out of the DOM and puts itself back. See HostPresence.
    effect(() => this.presence.set(this.render()));
  }
  protected readonly table = injectDataTable();
  protected readonly conditions = computed(() => this.table.filters.conditions());
  protected readonly filterFields = computed(() => this.table.filters.fields());
  protected readonly render = computed(
    () => this.table.options.filterable !== false && this.conditions().length > 0,
  );
}
