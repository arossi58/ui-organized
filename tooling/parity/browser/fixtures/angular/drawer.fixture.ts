import { Component } from "@angular/core";
import {
  UioDrawer,
  UioDrawerClose,
  UioDrawerDescription,
  UioDrawerFooter,
  UioDrawerTitle,
  UioDrawerTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The same elements React's case renders. `showGrabber` and `showClose`
 * arrive under `contentProps` because React's facade puts them on Content;
 * Angular's live on the one component. See `sheet.fixture.ts`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioDrawer,
    UioDrawerTrigger,
    UioDrawerTitle,
    UioDrawerDescription,
    UioDrawerFooter,
    UioDrawerClose,
  ],
  template: `
    <button uioDrawerTrigger [drawer]="d">Open</button>
    <uio-drawer
      #d="uioDrawer"
      [open]="p['defaultOpen'] ?? false"
      [showGrabber]="content['showGrabber'] ?? true"
      [showClose]="content['showClose'] ?? true"
      [modal]="p['modal'] ?? true"
    >
      <h2 uioDrawerTitle>Title</h2>
      <div uioDrawerDescription>Description</div>
      <div uioDrawerFooter><button uioDrawerClose>Close</button></div>
    </uio-drawer>
  `,
})
export class DrawerFixture {
  protected readonly p = parityProps();
  protected readonly content = this.p["contentProps"] ?? {};
}
