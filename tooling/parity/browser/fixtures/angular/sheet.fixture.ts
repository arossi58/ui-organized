import { Component } from "@angular/core";
import {
  UioSheet,
  UioSheetClose,
  UioSheetDescription,
  UioSheetFooter,
  UioSheetTitle,
  UioSheetTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same six elements React's case renders.
 *
 * `side` and `size` arrive under `contentProps` because React's facade puts
 * them on Content; Angular's live on the one component, so the nesting is
 * unpacked here — see `alert-dialog.fixture.ts` for the same note.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioSheet,
    UioSheetTrigger,
    UioSheetTitle,
    UioSheetDescription,
    UioSheetFooter,
    UioSheetClose,
  ],
  template: `
    <button uioSheetTrigger [sheet]="s">Open</button>
    <uio-sheet
      #s="uioSheet"
      [open]="p['defaultOpen'] ?? false"
      [side]="content['side'] ?? 'right'"
      [size]="content['size'] ?? 'md'"
      [showClose]="content['showClose'] ?? true"
      [modal]="p['modal'] ?? true"
    >
      <h2 uioSheetTitle>Title</h2>
      <div uioSheetDescription>Description</div>
      <div uioSheetFooter><button uioSheetClose>Close</button></div>
    </uio-sheet>
  `,
})
export class SheetFixture {
  protected readonly p = parityProps();
  protected readonly content = this.p["contentProps"] ?? {};
}
