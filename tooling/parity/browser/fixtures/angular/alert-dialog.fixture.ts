import { Component } from "@angular/core";
import {
  UioAlertDialog,
  UioAlertDialogCancel,
  UioAlertDialogConfirm,
  UioAlertDialogDescription,
  UioAlertDialogFooter,
  UioAlertDialogTitle,
  UioAlertDialogTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same eight elements React's case renders, in Angular's spelling.
 *
 * `contentProps` and `confirmProps` are nested in the scenario because React's
 * facade splits the component up — size and the close button belong to Content,
 * the intent to Confirm. Angular has one component and two directives, so the
 * nesting is unpacked here rather than in the scenario, which has to stay the
 * same object for all four libraries.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioAlertDialog,
    UioAlertDialogTrigger,
    UioAlertDialogTitle,
    UioAlertDialogDescription,
    UioAlertDialogFooter,
    UioAlertDialogCancel,
    UioAlertDialogConfirm,
  ],
  template: `
    <button uioAlertDialogTrigger [alertDialog]="d">Delete</button>
    <uio-alert-dialog
      #d="uioAlertDialog"
      [open]="p['defaultOpen'] ?? false"
      [size]="content['size'] ?? 'sm'"
      [showClose]="content['showClose'] ?? false"
      [modal]="p['modal'] ?? true"
    >
      <h2 uioAlertDialogTitle>Title</h2>
      <div uioAlertDialogDescription>Description</div>
      <div uioAlertDialogFooter>
        <button uioAlertDialogCancel>Cancel</button>
        <button uioAlertDialogConfirm [intent]="confirm['intent'] ?? 'primary'">Confirm</button>
      </div>
    </uio-alert-dialog>
  `,
})
export class AlertDialogFixture {
  protected readonly p = parityProps();
  protected readonly content = this.p["contentProps"] ?? {};
  protected readonly confirm = this.p["confirmProps"] ?? {};
}
