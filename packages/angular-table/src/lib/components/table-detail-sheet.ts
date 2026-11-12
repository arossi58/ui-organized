import {
  AfterViewInit,
  Component,
  DOCUMENT,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import type { RowData } from "@tanstack/angular-table";
import {
  HostPresence,
  UioAlertDialog,
  UioAlertDialogCancel,
  UioAlertDialogConfirm,
  UioAlertDialogDescription,
  UioAlertDialogFooter,
  UioAlertDialogTitle,
  UioButton,
  UioSheet,
  UioSheetDescription,
  UioSheetFooter,
  UioSheetTitle,
  type SheetSize,
} from "@ui-organized/angular";
import { internalGlyph as glyph } from "@ui-organized/angular";
import { injectDataTable } from "../core/table-context.js";
import type { AngularNode } from "../core/types.js";
import { addSheetPopupClass } from "./sheet-popup-class.js";

/**
 * The row detail panel.
 *
 * Core owns prev/next navigation and the dirty guard; this owns the two things
 * that are genuinely the adapter's: returning focus to the row the panel was
 * opened from, and rendering the confirmation as a real alert dialog.
 *
 * ── Differences from React's markup, all forced ─────────────────────────────
 *
 * - The host is taken out of the DOM (`HostPresence`). React's
 *   `TableDetailSheet` renders a portalled Sheet and AlertDialog and nothing in
 *   flow, so an Angular host element would be a node the other three do not
 *   have. That is also why there is no `class` input: the host it would land on
 *   is gone, and `UioSheet` has no input for a class on its popup —
 *   `data-table__detail` is added to the popup itself (`addSheetPopupClass`).
 * - Both overlays are `controlled`, and opened and closed from here rather than
 *   bound with `[open]`. Core decides whether the panel may close: with unsaved
 *   edits, Escape asks first, and the panel has to stay on screen under the
 *   question. A sheet that closed itself would be re-opened on top of the alert
 *   asking about it. Driving them here also lets the opener be remembered
 *   *before* focus moves into the panel, which is the element focus returns to.
 * - Contents render only while a row is open, for the reason `table-sheets.ts`
 *   gives: a select inside the panel attaches its surface when it is created,
 *   and one created at page load would be hidden from assistive tech.
 */
@Component({
  selector: "div[uioTableDetailSheet]",
  standalone: true,
  providers: [HostPresence],
  imports: [
    NgTemplateOutlet,
    UioAlertDialog,
    UioAlertDialogCancel,
    UioAlertDialogConfirm,
    UioAlertDialogDescription,
    UioAlertDialogFooter,
    UioAlertDialogTitle,
    UioButton,
    UioSheet,
    UioSheetDescription,
    UioSheetFooter,
    UioSheetTitle,
  ],
  template: `
    <uio-sheet side="right" [size]="size()" controlled (closeRequest)="close()">
      @if (row(); as row) {
        <!-- The title clears the Sheet's own close control, which sits in the
             same top-right corner; the row pager gets its own line rather than
             competing with it for that space. -->
        <div class="data-table__detail-header">
          <h2 uioSheetTitle>{{ title() }}</h2>
          @if (description(); as text) {
            <div uioSheetDescription>{{ text }}</div>
          }
        </div>

        <div class="data-table__detail-nav">
          <span class="data-table__detail-position">{{ position() }} of {{ total() }}</span>
          <button
            uioButton
            intent="ghost"
            size="sm"
            [icon]="glyph('chevron-up')"
            aria-label="Previous row"
            [disabled]="!canStep(-1)"
            (click)="step(-1)"
          ></button>
          <button
            uioButton
            intent="ghost"
            size="sm"
            [icon]="glyph('chevron-down')"
            aria-label="Next row"
            [disabled]="!canStep(1)"
            (click)="step(1)"
          ></button>
        </div>

        <div class="data-table__detail-body">
          <ng-container *ngTemplateOutlet="renderNode; context: { node: body(), row }" />
        </div>

        @if (footer(); as footer) {
          <div uioSheetFooter>
            <ng-container *ngTemplateOutlet="renderNode; context: { node: footer, row }" />
          </div>
        }
      }
    </uio-sheet>

    <!-- The dirty guard. Core decided it was needed; this only asks. -->
    <uio-alert-dialog controlled (closeRequest)="resolve(false)">
      <h2 uioAlertDialogTitle>Discard unsaved changes?</h2>
      <div uioAlertDialogDescription>
        This row has edits that have not been saved. Leaving now loses them.
      </div>
      <div uioAlertDialogFooter>
        <button uioAlertDialogCancel>Keep editing</button>
        <button uioAlertDialogConfirm intent="destructive" (click)="resolve(true)">Discard</button>
      </div>
    </uio-alert-dialog>

    <!-- An AngularNode: a template, given the row, or text. -->
    <ng-template #renderNode let-node="node" let-row="row">
      @if (isTemplate(node)) {
        <ng-container *ngTemplateOutlet="node; context: { $implicit: row }" />
      } @else if (node !== null && node !== undefined) {
        {{ node }}
      }
    </ng-template>
  `,
})
export class UioTableDetailSheet<T extends RowData> implements OnInit, AfterViewInit {
  /** Width of the panel. */
  readonly size = input<SheetSize>("md");

  protected readonly glyph = glyph;
  protected readonly table = injectDataTable<T>();
  private readonly detail = this.table.detail;
  private readonly presence = inject(HostPresence);
  private readonly document = inject(DOCUMENT);

  /** See `UioSheet` — decorator queries are the spelling both compilers register. */
  @ViewChild(UioSheet, { static: true }) private sheet!: UioSheet;
  @ViewChild(UioAlertDialog, { static: true }) private alert!: UioAlertDialog;
  /**
   * The sheet, once its popup is in the document. The query resolves before
   * that — `UioSheet` attaches the popup in its own `ngOnInit`, which runs
   * after this component's effects have — so the class waits for this.
   */
  private readonly attached = signal<UioSheet | undefined>(undefined);
  private syncing = false;

  protected readonly row = computed(() => this.detail.row());
  protected readonly title = computed(() => {
    const row = this.row();
    return (row && this.table.options.detail?.title?.(row)) ?? this.table.label();
  });
  protected readonly description = computed(() => {
    const row = this.row();
    return row ? (this.table.options.detail?.description?.(row) ?? null) : null;
  });
  protected readonly body = computed<AngularNode>(() => {
    const row = this.row();
    return row ? this.table.options.detail?.render(row) : null;
  });
  protected readonly footer = computed<AngularNode>(() => {
    const row = this.row();
    return row ? this.table.options.detail?.footer?.(row) : null;
  });
  protected readonly position = computed(() => {
    const index = this.detail.state().index;
    return index >= 0 ? index + 1 : 0;
  });
  protected readonly total = computed(() => this.table.rows().length);

  constructor() {
    addSheetPopupClass(this.attached, "data-table__detail");
    // Opened from a row, a keypress or the api: core's state is the only
    // source, and the overlays follow it.
    effect(() => {
      this.detail.state();
      untracked(() => this.sync());
    });
  }

  ngOnInit(): void {
    this.presence.hide();
  }

  ngAfterViewInit(): void {
    this.attached.set(this.sheet);
  }

  protected canStep(direction: -1 | 1): boolean {
    return this.detail.canStep(direction);
  }

  protected step(direction: -1 | 1): void {
    this.detail.step(direction);
    this.sync();
  }

  protected close(): void {
    this.detail.close();
    this.sync();
  }

  protected resolve(discard: boolean): void {
    this.detail.resolveConfirm(discard);
    this.sync();
  }

  protected isTemplate(node: AngularNode): node is TemplateRef<unknown> {
    return node instanceof TemplateRef;
  }

  /**
   * Bring both overlays into line with core. Called from the effect for state
   * that changed elsewhere, and straight from a handler for a user interaction,
   * so the DOM is current before the event returns — `show()` and `hide()`
   * flush, as every overlay in `@ui-organized/angular` does.
   *
   * The alert closes before the sheet: each gives focus back to its opener, and
   * when Discard closes both, the row has to be the last one focused. That
   * flush re-runs the effect from inside this call, which is why a nested call
   * returns at once — the outer one still has the sheet to close, in order.
   */
  private sync(): void {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const { rowId, confirming } = this.detail.state();
      const open = rowId !== null;
      const asking = confirming !== null;
      if (open && !this.sheet.open()) {
        this.sheet.rememberOpener(this.focused());
        this.sheet.show();
      }
      if (asking && !this.alert.open()) {
        this.alert.rememberOpener(this.focused());
        this.alert.show();
      }
      if (!asking && this.alert.open()) this.alert.hide();
      if (!open && this.sheet.open()) this.sheet.hide();
    } finally {
      this.syncing = false;
    }
  }

  private focused(): HTMLElement | null {
    const active = this.document.activeElement;
    return active instanceof HTMLElement && active !== this.document.body ? active : null;
  }
}
