import {
  Component,
  Injector,
  OnInit,
  computed,
  forwardRef,
  inject,
  input,
  runInInjectionContext,
} from "@angular/core";
import type {
  DataTableQuery,
  ResponsiveConfig,
  RowData,
  SelectionMode,
  TableEditPatch,
  TableSize,
  TableVariant,
  VirtualConfig,
} from "@ui-organized/table-core";
import { createDataTable } from "./core/create-data-table.js";
import { UIO_DATA_TABLE } from "./core/table-context.js";
import type {
  AngularNode,
  DataTableApi,
  BulkAction,
  DetailConfig,
  EmptyStateConfig,
  RowAction,
  TableAction,
  TableColumn,
  TableFilterInput,
  UseDataTableOptions,
} from "./core/types.js";
import { UioToolbar } from "@ui-organized/angular";
import { UioTable, UioTableBody, UioTableHeader, UioTableViewport } from "./components/table.js";
import { UioTableFilters } from "./components/table-filters.js";
import { UioTablePagination } from "./components/table-pagination.js";
import { UioTableSelectionBar } from "./components/table-selection-bar.js";
import { UioTableToolbar } from "./components/table-toolbar.js";

/**
 * Layer 3: the whole table from an input object.
 *
 * It composes exactly the parts a consumer would compose by hand — which is the
 * test of whether layer 2 is real. Anything this does that the parts cannot is a
 * gap in the parts, not a feature of the wrapper.
 *
 * ── Why the inputs are spelled out ──────────────────────────────────────────
 *
 * React, Vue and Svelte all hand their whole props object to the composable. An
 * Angular component has no such object: `input()` is one signal per option, and
 * the options getter below assembles them. That is the last of the three costs
 * Angular carries, and it is the cheap one — it costs length, not correctness,
 * and it buys a properly typed template API in exchange.
 */
@Component({
  selector: "div[uioDataTable]",
  standalone: true,
  // `UioTable` as a host directive rather than an element in the template: the
  // caller's own `<div uioDataTable>` *is* `.data-table`, so there is no wrapper
  // node. React's `<DataTable>` renders that div as its root and nothing above
  // it; this is how Angular says the same thing.
  hostDirectives: [UioTable],
  imports: [
    UioToolbar,
    UioTableToolbar,
    UioTableFilters,
    UioTableSelectionBar,
    UioTableViewport,
    UioTableHeader,
    UioTableBody,
    UioTablePagination,
  ],
  providers: [
    {
      provide: UIO_DATA_TABLE,
      /**
       * The api is built once, on the first ask, and this provider hands that
       * same instance to every part below rather than building a second one.
       */
      useFactory: (host: UioDataTable<never>) => host.ensureApi(),
      deps: [forwardRef(() => UioDataTable)],
    },
  ],
  template: `
    <div uioTableToolbar></div>
    @if (filterable()) {
      <div uioTableFilters></div>
    }
    <div uioTableSelectionBar></div>

    <div uioTableViewport>
      <thead uioTableHeader></thead>
      <tbody uioTableBody></tbody>
    </div>

    @if (paginated()) {
      <div uioTablePagination></div>
    }
  `,
})
export class UioDataTable<T extends RowData> implements OnInit {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  /**
   * The table's accessible name. Required, not optional: it becomes the
   * `<caption>`, and a table announced as "table" and nothing else is the most
   * common data-table accessibility failure there is.
   */
  readonly label = input.required<string>();
  readonly captionVisible = input(false);
  readonly getRowId = input<((row: T, index: number) => string) | undefined>(undefined);

  readonly size = input<TableSize>("md");
  readonly variant = input<TableVariant>("default");

  readonly selection = input<SelectionMode>("none");
  readonly sortable = input(true);
  readonly filterable = input(true);
  readonly searchable = input(true);
  readonly paginated = input(false);
  readonly pageSize = input<number | undefined>(undefined);
  readonly resizable = input(false);
  readonly reorderable = input(false);
  readonly hideableColumns = input(false);
  readonly sortMenu = input(true);
  readonly exportable = input(false);

  readonly virtual = input<boolean | VirtualConfig>(true);
  readonly maxHeight = input<number | string | undefined>(undefined);

  readonly loading = input(false);
  readonly error = input<AngularNode>(undefined);
  readonly empty = input<EmptyStateConfig | undefined>(undefined);

  readonly manual = input(false);
  readonly rowCount = input<number | undefined>(undefined);
  readonly onQueryChange = input<((query: DataTableQuery) => void) | undefined>(undefined);
  readonly onLoadMore = input<(() => void) | undefined>(undefined);

  readonly onRowClick = input<((row: T) => void) | undefined>(undefined);
  readonly onEdit = input<((patch: TableEditPatch<T>) => void | Promise<void>) | undefined>(
    undefined,
  );
  readonly rowActions = input<RowAction<T>[] | undefined>(undefined);
  readonly bulkActions = input<BulkAction<T>[] | undefined>(undefined);
  readonly actions = input<TableAction[] | undefined>(undefined);
  readonly detail = input<DetailConfig<T> | undefined>(undefined);
  readonly responsive = input<ResponsiveConfig | undefined>(undefined);

  readonly defaultSorting = input<{ id: string; desc: boolean }[] | undefined>(undefined);
  readonly defaultColumnVisibility = input<Record<string, boolean> | undefined>(undefined);
  readonly defaultFilters = input<TableFilterInput[] | undefined>(undefined);

  /** Every input, as the one object the shared factory reads. */
  private readonly options = computed<UseDataTableOptions<T>>(() => ({
    data: this.data(),
    columns: this.columns(),
    label: this.label(),
    captionVisible: this.captionVisible(),
    getRowId: this.getRowId(),
    size: this.size(),
    variant: this.variant(),
    selection: this.selection(),
    sortable: this.sortable(),
    filterable: this.filterable(),
    searchable: this.searchable(),
    paginated: this.paginated(),
    pageSize: this.pageSize(),
    resizable: this.resizable(),
    reorderable: this.reorderable(),
    hideableColumns: this.hideableColumns(),
    sortMenu: this.sortMenu(),
    exportable: this.exportable(),
    virtual: this.virtual(),
    maxHeight: this.maxHeight(),
    loading: this.loading(),
    error: this.error(),
    empty: this.empty(),
    manual: this.manual(),
    rowCount: this.rowCount(),
    onQueryChange: this.onQueryChange(),
    onLoadMore: this.onLoadMore(),
    onRowClick: this.onRowClick(),
    onEdit: this.onEdit(),
    rowActions: this.rowActions(),
    bulkActions: this.bulkActions(),
    actions: this.actions(),
    detail: this.detail(),
    responsive: this.responsive(),
    defaultSorting: this.defaultSorting(),
    defaultColumnVisibility: this.defaultColumnVisibility(),
    defaultFilters: this.defaultFilters(),
  }));

  private readonly injector = inject(Injector);

  /**
   * Public because the provider above reads it; not part of the template API.
   *
   * Built in `ngOnInit` rather than in a field initialiser, and that is forced
   * rather than chosen: `createDataTable` reads `data`, `columns` and `label`
   * immediately — `injectTable` has to construct a table out of them — and a
   * **required input has no value during construction**. Angular says so
   * outright (NG0950), and the table simply failed to bootstrap.
   *
   * `runInInjectionContext` because `ngOnInit` is not one, and the factory needs
   * `inject` for `DestroyRef`, `injectTable` and `injectVirtualizer`. The
   * provider above resolves lazily — a child injects it while the view is being
   * created, which is after this has run.
   */
  private created: DataTableApi<T> | null = null;

  /**
   * Built on first ask rather than in `ngOnInit`, so the order between this
   * component's lifecycle and a child part's injection stops mattering. Either
   * way the inputs are set by the time it runs, which is the whole constraint.
   */
  ensureApi(): DataTableApi<T> {
    this.created ??= runInInjectionContext(this.injector, () =>
      createDataTable<T>(() => this.options()),
    );
    return this.created;
  }

  ngOnInit(): void {
    this.ensureApi();
  }
}
