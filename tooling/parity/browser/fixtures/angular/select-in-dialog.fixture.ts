import { Component } from "@angular/core";
import { UioDialog, UioDialogTitle, UioDialogTrigger, UioSelect } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Two portalled surfaces at once, and the pair the shared stylesheet
 * deliberately stacks in a particular order.
 *
 * This is the case `PopoverInDialog` was a stand-in for while the components did
 * not exist, run against the same React output the other three libraries are
 * compared to — so it checks the *rendered* contract as well as the stacking,
 * including the `aria-hidden` marks the dialog leaves on the select's positioner.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDialog, UioDialogTrigger, UioDialogTitle, UioSelect],
  template: `
    <button uioDialogTrigger [dialog]="d">Open</button>
    <uio-dialog #d="uioDialog">
      <h2 uioDialogTitle>Title</h2>
      <div uioSelect [options]="p['options'] ?? []" label="Fruit"></div>
    </uio-dialog>
  `,
})
export class SelectInDialogFixture {
  protected readonly p = parityProps();
}
