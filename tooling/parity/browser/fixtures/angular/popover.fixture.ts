import { Component } from "@angular/core";
import {
  UioPopover,
  UioPopoverClose,
  UioPopoverDescription,
  UioPopoverTitle,
  UioPopoverTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * React's case puts `side`/`align`/`sideOffset` on `<PopoverContent>` and Ark
 * configures them on the Root; Angular's surface *is* the content, so they are
 * inputs on `<uio-popover>` and the scenario's `contentProps` land there
 * directly.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioPopover,
    UioPopoverTrigger,
    UioPopoverTitle,
    UioPopoverDescription,
    UioPopoverClose,
  ],
  template: `
    <button uioPopoverTrigger [popover]="p">Open</button>
    <uio-popover
      #p="uioPopover"
      [side]="content['side'] ?? 'bottom'"
      [align]="content['align'] ?? 'center'"
      [sideOffset]="content['sideOffset'] ?? 8"
      [alignOffset]="content['alignOffset'] ?? 0"
      [modal]="props['modal'] ?? false"
    >
      <div uioPopoverTitle>Title</div>
      <div uioPopoverDescription>Description</div>
      <button uioPopoverClose>Close</button>
    </uio-popover>
  `,
})
export class PopoverFixture {
  protected readonly props = parityProps();
  protected readonly content = (this.props["contentProps"] ?? {}) as Record<string, any>;
}
