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
  UioChipSegment,
  UioDateInput,
  UioDivider,
  UioInput,
  UioListbox,
  UioMenu,
  UioMenuItem,
  UioMenuRadioGroup,
  UioMenuRadioItem,
  UioMenuSeparator,
  UioMenuTrigger,
  UioNumberField,
  UioPopover,
  UioPopoverTitle,
  UioPopoverTrigger,
  UioSearchInput,
  UioSegmentedControl,
  UioSelect,
} from "@ui-organized/angular";
import {
  searchOptions,
  type FilterOperatorArity,
  type TableFilterCondition,
  type TableFilterValue,
  afterRowEntrance,
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
    const chips = [...bar.querySelectorAll<HTMLElement>("[data-filter-id]")];
    const next = chips.find((element) => element.dataset["filterId"] !== removedId);
    (
      next?.querySelector<HTMLElement>("button") ?? bar.querySelector<HTMLElement>("button")
    )?.focus();
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
  // A real element, not <ng-container>: Angular cannot host a component on a
  // container, and the failure is a runtime assertion that leaves the filter bar
  // empty. `display: contents` keeps the host out of the surrounding layout.
  host: { style: "display: contents" },
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
 * One condition's value editor (Figma 2298:726): the value, then a rule and a
 * remove. The field and the operator have segments of their own on the chip,
 * so the editor carries only what the value segment opens.
 */
@Component({
  selector: "[uioTableFilterEditor]",
  standalone: true,
  // A real element, not <ng-container>: Angular cannot host a component on a
  // container, and the failure is a runtime assertion that leaves the filter bar
  // empty. `display: contents` keeps the host out of the surrounding layout.
  host: { style: "display: contents" },
  imports: [UioButton, UioDivider, UioTableFilterValueEditor],
  template: `
    <div uioTableFilterValueEditor [condition]="condition()" [arity]="arity()"></div>

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

  protected remove(): void {
    const id = this.condition().id;
    this.table.filters.remove(id);
    focusAfterRemoval(id);
  }
}

type ChipMenu = "field" | "operator";

/**
 * One condition, as a segmented chip (Figma 2462:2636): "Name | is greater than
 * | 30". Each segment opens the control for the one parameter it shows — the
 * field menu, the operator menu, the value editor — so changing a filter is one
 * click on the part you mean rather than a trip through a form.
 *
 * Removal lives in the field menu and at the foot of the value editor, not in a
 * dismiss button: a fourth 24px target in a row of segments is a coin-flip on
 * touch, and an operator that takes no value ("is empty") has no value editor to
 * put it in.
 */
@Component({
  selector: "[uioTableFilterChip]",
  standalone: true,
  // A real element, not <ng-container>: Angular cannot host a component on a
  // container, and the failure is a runtime assertion that leaves the filter bar
  // empty. `display: contents` keeps the host out of the surrounding layout.
  host: { style: "display: contents" },
  imports: [
    UioChip,
    UioChipSegment,
    UioMenu,
    UioMenuItem,
    UioMenuRadioGroup,
    UioMenuRadioItem,
    UioMenuSeparator,
    UioMenuTrigger,
    UioPopover,
    UioPopoverTitle,
    UioPopoverTrigger,
    UioTableFilterEditor,
  ],
  template: `
    <!--
      The group's name is the whole sentence, so a screen reader moving into any
      one segment hears what the filter *is* before what the button does.

      The menus and the popover sit *beside* the chip, not inside it: segments
      have to be its direct children for the dividers and the pill's end padding
      to land, and their surfaces are overlays anchored to the trigger anyway.
    -->
    <span
      uioChip
      class="data-table__filter-chip"
      [attr.aria-label]="'Filter: ' + description().text"
      [selected]="editing() || menu() !== null"
      [incomplete]="!description().complete"
      [attr.data-column-id]="condition().columnId"
      [attr.data-filter-id]="condition().id"
    >
      <button uioChipSegment part="label" uioMenuTrigger [menu]="fieldMenu">
        {{ description().field }}
      </button>
      <button uioChipSegment part="operator" uioMenuTrigger [menu]="operatorMenu">
        {{ description().relative }}
      </button>
      @if (takesValue()) {
        <button uioChipSegment part="value" uioPopoverTrigger [popover]="popover">
          {{ description().value }}
        </button>
      }
    </span>

    <!-- \`select\` is the menu's output, not the item's: an item reports its value
         through the menu, and \`(select)\` on an item binds a DOM event that never
         fires. Radio items report through their group instead. -->
    <uio-menu
      #fieldMenu="uioMenu"
      class="data-table__filter-picker"
      [open]="menu() === 'field'"
      (openChange)="setMenu('field', $event)"
      (select)="$event === 'remove' && remove()"
    >
      <div
        uioMenuRadioGroup
        [value]="condition().columnId"
        (valueChange)="table.filters.changeField(condition().id, $event)"
      >
        @for (field of table.filters.fields(); track field.columnId) {
          <div uioMenuRadioItem [value]="field.columnId">{{ field.label }}</div>
        }
      </div>
      <div uioMenuSeparator></div>
      <div uioMenuItem value="remove" icon="trash">Remove filter</div>
    </uio-menu>

    <uio-menu
      #operatorMenu="uioMenu"
      class="data-table__filter-picker"
      [open]="menu() === 'operator'"
      (openChange)="setMenu('operator', $event)"
    >
      <div
        uioMenuRadioGroup
        [value]="condition().operator"
        (valueChange)="table.filters.update(condition().id, { operator: $event })"
      >
        @for (operator of operators(); track operator.id) {
          <div uioMenuRadioItem [value]="operator.id">{{ operator.label }}</div>
        }
      </div>
    </uio-menu>

    <!-- Always present, opened only while the condition takes a value: a
         reference cannot cross from one @if block into another. -->
    <uio-popover
      #popover="uioPopover"
      class="data-table__filter-editor-popup"
      side="bottom"
      align="start"
      [open]="open() && takesValue()"
      (openChange)="setOpen($event)"
      (keydown)="onKeyDown($event)"
    >
      <div #editor class="data-table__filter-editor">
        <h2 uioPopoverTitle class="data-table__filter-editor-title">
          {{ description().field }} {{ description().relative }}
        </h2>
        <div uioTableFilterEditor [condition]="condition()"></div>
      </div>
    </uio-popover>
  `,
})
export class UioTableFilterChip {
  readonly condition = input.required<TableFilterCondition>();

  protected readonly table = injectDataTable();
  private readonly editor = viewChild<ElementRef<HTMLElement>>("editor");

  // Which chip's editor is open is filter state, not chip state: the chip that
  // opens is often the one the *header* just created, and removing an open
  // condition has to close its editor rather than leave a dangling id behind.
  protected readonly editing = computed(
    () => this.table.filters.editing() === this.condition().id,
  );
  // The first chip arrives inside a row that is still animating open, so the
  // editor waits for the row to settle rather than open against a moving
  // anchor and jump. An existing chip settles at once.
  private readonly settled = signal(false);
  protected readonly open = computed(() => this.editing() && this.settled());
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // The two menus are this chip's alone, so they are local.
  protected readonly menu = signal<ChipMenu | null>(null);
  protected readonly description = computed(() => this.table.filters.describe(this.condition()));
  protected readonly takesValue = computed(
    () => this.table.filters.arityOf(this.condition()) !== "none",
  );
  protected readonly operators = computed(() => this.table.filters.operatorsFor(this.condition()));

  // The condition as it was when the editor opened, so Escape can revert it.
  private snapshot: TableFilterCondition | null = null;

  constructor() {
    effect((onCleanup) => {
      if (!this.editing()) {
        this.settled.set(false);
        return;
      }
      if (typeof requestAnimationFrame !== "function") {
        this.settled.set(true);
        return;
      }
      // A frame first: the effect can run before a new chip is attached, and a
      // detached row reports no animations.
      let cancel = () => {};
      const frame = requestAnimationFrame(() => {
        cancel = afterRowEntrance(this.host.nativeElement, () => this.settled.set(true));
      });
      onCleanup(() => {
        cancelAnimationFrame(frame);
        cancel();
      });
    });

    effect(() => {
      // Only when the editor opens — capturing on every change would defeat it.
      if (this.open()) this.snapshot = this.condition();
    });

    /**
     * Put focus in the first typeable field once the popover opens.
     *
     * **Two** frames, not one: the overlay moves focus into the surface on its
     * own first, and waiting a second frame puts this last, which is the only
     * thing that sticks.
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
          // Already there — Ark's own initial focus can land on the field, and
          // the user may be typing by now. Selecting would eat what they typed.
          if (!field || field === document.activeElement) return;
          field.focus();
          field.select();
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

  protected setMenu(name: ChipMenu, next: boolean): void {
    if (next) this.menu.set(name);
    else if (this.menu() === name) this.menu.set(null);
  }

  protected remove(): void {
    const id = this.condition().id;
    this.table.filters.remove(id);
    focusAfterRemoval(id);
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
      <uio-menu
        #menu="uioMenu"
        align="end"
        class="data-table__filter-picker"
        (select)="table.filters.add($event)"
      >
        <!--
          A field that already carries conditions stays in the list — several
          conditions on one column is the point — with a count so it is obvious
          this adds another rather than replacing.
        -->
        @for (field of fields(); track field.columnId) {
          <div uioMenuItem [value]="field.columnId">
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
        <span uioTableFilterChip [condition]="condition"></span>
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
      <uio-menu
        #addSurface="uioMenu"
        align="end"
        class="data-table__filter-picker"
        (select)="table.filters.add($event)"
      >
        @for (field of filterFields(); track field.columnId) {
          <div uioMenuItem [value]="field.columnId">
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
