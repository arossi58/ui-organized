import { Component } from "@angular/core";
import {
  UioDialog,
  UioDialogTitle,
  UioDialogTrigger,
  UioPopover,
  UioPopoverTitle,
  UioPopoverTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT } from "./parity-props.js";

/**
 * Two CDK overlays at once, which is the arrangement the Angular port was most
 * likely to fail on.
 *
 * The shared stylesheet declares stacking on the popup and deliberately puts an
 * anchored surface *above* a modal one, so a popover opened from inside a dialog
 * covers it. The CDK has no positioner. It parents every overlay to one
 * container and stacks every pane identically, so without `UioOverlayStacking`
 * the popover renders behind its own host — a failure with no error, no warning,
 * and a perfectly correct DOM.
 *
 * This was raw CDK calls while the components did not exist. It is now the
 * components, which is the only version of it that proves anything: the
 * mechanism is exercised where a consumer meets it, with two surfaces that were
 * both attached at page load and are ordered by what their own stylesheet
 * declares — and, in the browser's top layer, by `raiseSurface`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioDialog,
    UioDialogTrigger,
    UioDialogTitle,
    UioPopover,
    UioPopoverTrigger,
    UioPopoverTitle,
  ],
  template: `
    <button uioDialogTrigger [dialog]="d">Open dialog</button>
    <uio-dialog #d="uioDialog">
      <h2 uioDialogTitle>Dialog</h2>
      <button uioPopoverTrigger [popover]="p">Open popover</button>
      <uio-popover #p="uioPopover">
        <div uioPopoverTitle>Popover content</div>
      </uio-popover>
    </uio-dialog>
  `,
})
export class PopoverInDialogFixture {}
