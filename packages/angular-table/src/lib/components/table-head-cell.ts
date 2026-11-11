import { Component, computed, input } from "@angular/core";
import { FlexRender } from "@tanstack/angular-table";
import { UioIcon } from "@ui-organized/angular";
import {
  alignOf,
  dropSideAt,
  getHeadCellProps,
  getResizeHandleProps,
  metaOf,
  resizeKeyDown,
  stickyPositionOf,
  type RowData,
  type TableHeaderInstance,
  type TableInstance,
} from "@ui-organized/table-core";
import { UioTablePropsHost } from "../core/table-props-host.js";
import { injectDataTable } from "../core/table-context.js";
import { internalGlyph as glyph } from "@ui-organized/angular";

/**
 * Pointer drag and keyboard, on one control.
 *
 * The drag is TanStack's own handler; the keyboard is core's `resizeKeyDown`, so
 * the two cannot drift. It is a `role="separator"` with `aria-valuenow`, which is
 * what makes the column width something a screen reader can report rather than
 * something only a mouse can discover.
 */
@Component({
  selector: "button[uioTableResizeHandle]",
  standalone: true,
  host: {
    type: "button",
    "(mousedown)": "startResize($event)",
    "(touchstart)": "startResize($event)",
    "(click)": "$event.stopPropagation()",
    "(keydown)": "onKeyDown($event)",
  },
  template: "",
})
export class UioTableResizeHandle<T extends RowData> extends UioTablePropsHost {
  readonly header = input.required<TableHeaderInstance<T>>();

  protected readonly table = injectDataTable<T>();
  private readonly column = computed(() => this.header().column);

  private readonly bounds = computed(() => {
    const width = this.column().getSize();
    return {
      width,
      min: this.column().columnDef.minSize ?? 0,
      max: this.column().columnDef.maxSize ?? width,
    };
  });

  /** Applied to this button by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() => {
    const headerDef = this.column().columnDef.header;
    const bounds = this.bounds();
    return getResizeHandleProps({
      columnId: this.column().id,
      columnLabel: typeof headerDef === "string" ? headerDef : this.column().id,
      width: bounds.width,
      min: bounds.min,
      max: bounds.max,
      active: this.column().getIsResizing(),
    });
  });

  /** Stops the header's sort button from firing on the same press. */
  protected startResize(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.header().getResizeHandler()(event);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const action = resizeKeyDown(this.bounds(), {
      key: event.key,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });
    if (action.type === "none") return;
    event.preventDefault();
    event.stopPropagation();
    const id = this.column().id;
    if (action.type === "reset") {
      this.table.table.setColumnSizing((old: Record<string, number>) => {
        const next = { ...old };
        delete next[id];
        return next;
      });
      return;
    }
    this.table.table.setColumnSizing((old: Record<string, number>) => ({
      ...old,
      [id]: action.width,
    }));
  }
}

/** One header cell: the sort control, the roving tab stop, and the resize grip. */
@Component({
  selector: "th[uioTableHeadCell]",
  standalone: true,
  imports: [FlexRender, UioIcon, UioTableResizeHandle],
  host: {
    "[attr.data-cell]": "'-1:' + index()",
    "[attr.tabindex]": "tabIndex()",
    "(focus)": "onFocus()",
    // The whole header is a drop target; only its label area (in the
    // template) is a drag source.
    "[attr.data-dragging]": "dragging() ? '' : null",
    "[attr.data-drop]": "dropSide() ?? null",
    "(dragover)": "onDragOver($event)",
    "(drop)": "onDrop($event)",
  },
  template: `
    <!--
      The drag source is the label area, not the <th>: with the <th>
      draggable, pressing the resize handle started a native drag that took
      the pointer away from the resize. The handle sits outside this element.
    -->
    <div
      class="data-table__head-inner"
      [attr.draggable]="movable() ? 'true' : null"
      (dragstart)="onDragStart($event)"
      (dragend)="onDragEnd()"
    >
      <!--
        The roving tabindex covers the header row too, so ArrowUp out of the
        first body row lands somewhere focusable and Enter sorts from there.
        Inner controls are not their own tab stops in a grid; the cell is.
      -->
      @if (sortable()) {
        <button
          type="button"
          class="data-table__sort-button"
          [attr.tabindex]="interactive() ? -1 : null"
          (click)="toggleSort($event)"
        >
          <span class="data-table__head-label">
            @if (!header().isPlaceholder) {
              <ng-container *flexRenderHeader="header(); let rendered">{{ rendered }}</ng-container>
            }
          </span>
          @if (editable()) {
            <!--
              The pencil, and the words with it: as part of the column header,
              ", editable" is announced with every cell in the column.
            -->
            <span class="data-table__edit-icon">
              <span uioIcon [name]="glyph('edit')" [size]="14"></span>
              <span class="data-table__sr-only">, editable</span>
            </span>
          }
          <span class="data-table__sort-icon">
            <span uioIcon [name]="sortIcon()" [size]="14"></span>
          </span>
        </button>
      } @else {
        <span class="data-table__head-label">
          @if (!header().isPlaceholder) {
            <ng-container *flexRenderHeader="header(); let rendered">{{ rendered }}</ng-container>
          }
        </span>
        @if (editable()) {
          <!--
            The pencil, and the words with it: as part of the column header,
            ", editable" is announced with every cell in the column.
          -->
          <span class="data-table__edit-icon">
            <span uioIcon [name]="glyph('edit')" [size]="14"></span>
            <span class="data-table__sr-only">, editable</span>
          </span>
        }
      }
      @if (movable()) {
        <!--
          Left and right, for a column that can be moved: the click-and-keyboard
          half of dragging the header. In an interactive grid they are not tab
          stops, like every control inside a cell; Alt+Arrow on the focused
          header is the keyboard route there.
        -->
        <span class="data-table__move" [attr.data-mode]="table.reorder.mode()">
          <button
            #moveLeft
            type="button"
            class="data-table__move-button"
            [attr.aria-label]="'Move ' + headerText() + ' left'"
            [disabled]="!table.reorder.canMove(column().id, -1)"
            [attr.tabindex]="interactive() ? -1 : null"
            (click)="pressMove(-1, $event, moveLeft, moveRight)"
          >
            <span uioIcon [name]="glyph('chevron-left')" [size]="16"></span>
          </button>
          <button
            #moveRight
            type="button"
            class="data-table__move-button"
            [attr.aria-label]="'Move ' + headerText() + ' right'"
            [disabled]="!table.reorder.canMove(column().id, 1)"
            [attr.tabindex]="interactive() ? -1 : null"
            (click)="pressMove(1, $event, moveRight, moveLeft)"
          >
            <span uioIcon [name]="glyph('chevron-right')" [size]="16"></span>
          </button>
        </span>
      }
    </div>
    @if (column().getCanResize()) {
      <button uioTableResizeHandle [header]="header()"></button>
    }
  `,
})
export class UioTableHeadCell<T extends RowData> extends UioTablePropsHost {
  protected readonly glyph = glyph;
  readonly header = input.required<TableHeaderInstance<T>>();
  readonly index = input.required<number>();

  protected readonly table = injectDataTable<T>();
  protected readonly column = computed(() => this.header().column);
  protected readonly sortable = computed(() => this.column().getCanSort());
  protected readonly sorted = computed(() => this.column().getIsSorted());
  protected readonly interactive = computed(() => this.table.interactive());
  protected readonly editable = computed(() => Boolean(metaOf<T>(this.column().columnDef)?.edit));
  protected readonly sortIcon = computed(() =>
    this.sorted() === "desc" ? "sort-desc" : "sort-asc",
  );

  private readonly focused = computed(() => {
    const cursor = this.table.focus.cursor();
    return this.interactive() && cursor.row === -1 && cursor.col === this.index();
  });

  protected readonly tabIndex = computed(() =>
    this.interactive() ? (this.focused() ? 0 : -1) : null,
  );

  /** Applied to this `<th>` by `UioTablePropsHost`. */
  protected readonly tableProps = computed(() =>
    getHeadCellProps({
      columnId: this.column().id,
      index: this.index(),
      align: alignOf(this.column().columnDef),
      sortable: this.sortable(),
      sortDirection: this.sorted() === false ? false : (this.sorted() as "asc" | "desc"),
      sticky: stickyPositionOf(this.table.table as unknown as TableInstance<T>, this.column()),
      resizing: this.column().getIsResizing(),
      interactive: this.interactive(),
      editable: this.editable(),
    }),
  );

  protected onFocus(): void {
    if (this.interactive()) this.table.focus.setCursor({ row: -1, col: this.index() });
  }

  // ── Column reordering ─────────────────────────────────────────────────────

  protected readonly movable = computed(
    () => this.table.reorder.active() && this.table.reorder.isMovable(this.column().id),
  );
  protected readonly headerText = computed(() => {
    const header = this.column().columnDef.header;
    return typeof header === "string" ? header : this.column().id;
  });
  protected readonly dragging = computed(
    () => this.table.reorder.drag()?.source === this.column().id,
  );
  protected readonly dropSide = computed(() => {
    const drag = this.table.reorder.drag();
    const id = this.column().id;
    return drag && drag.target === id && drag.source !== id ? drag.side : undefined;
  });

  protected onDragStart(event: DragEvent): void {
    if (!this.movable()) return;
    const origin = event.target as Element | null;
    if (origin?.closest(".data-table__move")) {
      event.preventDefault();
      return;
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", this.column().id);
    }
    this.table.reorder.setDrag({ source: this.column().id, target: null, side: "before" });
  }

  protected onDragOver(event: DragEvent): void {
    const drag = this.table.reorder.drag();
    if (!this.movable() || !drag) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const side = dropSideAt(
      event.clientX,
      (event.currentTarget as HTMLElement).getBoundingClientRect(),
    );
    const id = this.column().id;
    if (drag.target !== id || drag.side !== side) {
      this.table.reorder.setDrag({ ...drag, target: id, side });
    }
  }

  protected onDrop(event: DragEvent): void {
    const drag = this.table.reorder.drag();
    if (!this.movable() || !drag) return;
    event.preventDefault();
    const side = dropSideAt(
      event.clientX,
      (event.currentTarget as HTMLElement).getBoundingClientRect(),
    );
    this.table.reorder.drop(drag.source, this.column().id, side);
    this.table.reorder.setDrag(null);
  }

  protected onDragEnd(): void {
    if (this.movable()) this.table.reorder.setDrag(null);
  }

  /**
   * Re-rendering in the new order moves this header's DOM node, and a moved
   * node drops focus. Put it back on the same button — or on the other one,
   * when this move took the column to the end it pointed at. Only after a
   * keyboard press: a mouse click does not leave focus on the button.
   */
  protected pressMove(
    direction: -1 | 1,
    event: MouseEvent,
    own: HTMLButtonElement,
    other: HTMLButtonElement,
  ): void {
    const hadFocus = document.activeElement === event.currentTarget;
    this.table.reorder.move(this.column().id, direction);
    if (!hadFocus || typeof requestAnimationFrame !== "function") return;
    requestAnimationFrame(() => (own.disabled ? other : own).focus());
  }

  protected toggleSort(event: Event): void {
    this.column().getToggleSortingHandler()?.(event);
  }
}
