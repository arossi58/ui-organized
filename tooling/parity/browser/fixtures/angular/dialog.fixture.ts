import { Component } from "@angular/core";
import {
  UioDialog,
  UioDialogDescription,
  UioDialogFooter,
  UioDialogTitle,
  UioDialogTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same five elements React's case renders, in Angular's spelling.
 *
 * The trigger names the dialog through a template reference rather than being
 * projected into it: it has to stay where the caller wrote it while everything
 * else portals, and two projection slots with two destinations would be a
 * heavier API than a `#d`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDialog, UioDialogTrigger, UioDialogTitle, UioDialogDescription, UioDialogFooter],
  template: `
    <button uioDialogTrigger [dialog]="d">Open</button>
    <uio-dialog #d="uioDialog" [modal]="p['modal'] ?? true">
      <h2 uioDialogTitle>Title</h2>
      <div uioDialogDescription>Description</div>
      <div uioDialogFooter>Footer</div>
    </uio-dialog>
  `,
})
export class DialogFixture {
  protected readonly p = parityProps();
}
