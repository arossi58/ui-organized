import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  inject,
  type TemplateRef,
} from "@angular/core";
import { UioOverlayStacking } from "@ui-organized/angular";
import { ANGULAR_ROOT } from "./parity-props.js";

/**
 * Two CDK overlays at once, which is the arrangement the Angular port was most
 * likely to fail on.
 *
 * The shared stylesheet declares stacking on the popup and deliberately puts an
 * anchored surface *above* a modal one, so a popover opened from inside a dialog
 * covers it. The CDK has no positioner and stacks every pane identically inside
 * one container, so without `UioOverlayStacking` the popover renders behind its
 * own host — a failure with no error, no warning, and a perfectly correct DOM.
 *
 * This is a harness fixture rather than a component because the components do
 * not exist yet. What it exercises is the mechanism they will both use, with the
 * real class names, so the answer is about the design system rather than about a
 * mock.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioOverlayStacking],
  template: `
    <button data-scope="dialog" data-part="trigger" (click)="openDialog()">Open dialog</button>

    <ng-template #dialogSurface>
      <div
        class="dialog__positioner"
        uioOverlayStacking
        data-scope="dialog"
        data-part="positioner"
      >
        <div
          class="dialog__popup dialog__popup--md"
          data-scope="dialog"
          data-part="content"
          data-state="open"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <button #popoverTrigger data-scope="popover" data-part="trigger" (click)="openPopover()">
            Open popover
          </button>
        </div>
      </div>
    </ng-template>

    <ng-template #popoverSurface>
      <div
        class="popover__positioner"
        uioOverlayStacking
        data-scope="popover"
        data-part="positioner"
      >
        <div
          class="popover__popup"
          data-scope="popover"
          data-part="content"
          data-state="open"
          role="dialog"
        >
          Popover content
        </div>
      </div>
    </ng-template>
  `,
})
export class PopoverInDialogFixture {
  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);

  /**
   * `@ViewChild` rather than `viewChild()`, for the same reason the props arrive
   * by injection: initializer-based APIs need the AOT compiler and these
   * fixtures are compiled by JIT, where `viewChild.required` resolves to nothing
   * and throws NG0951 on first read. The library itself uses the signal APIs —
   * ng-packagr compiles it ahead of time.
   */
  @ViewChild("dialogSurface") private dialogSurface!: TemplateRef<unknown>;
  @ViewChild("popoverSurface") private popoverSurface!: TemplateRef<unknown>;
  @ViewChild("popoverTrigger") private popoverTrigger?: ElementRef<HTMLElement>;

  private dialogRef?: OverlayRef;
  private popoverRef?: OverlayRef;

  protected openDialog(): void {
    this.dialogRef = this.overlay.create({
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
    });
    this.dialogRef.attach(new TemplatePortal(this.dialogSurface, this.viewContainer));
  }

  protected openPopover(): void {
    const trigger = this.popoverTrigger;
    if (!trigger) return;
    this.popoverRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top" },
        ]),
    });
    this.popoverRef.attach(new TemplatePortal(this.popoverSurface, this.viewContainer));
  }
}
