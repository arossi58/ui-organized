import { Component } from "@angular/core";
import { UioCommandMenu } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `defaultOpen` in React is the uncontrolled start; a `model()` is the same until something binds it. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCommandMenu],
  template: `
    <uio-command-menu
      [items]="p['items'] ?? []"
      [open]="!!p['defaultOpen']"
      [closeOnSelect]="p['closeOnSelect'] ?? true"
      [hotkey]="p['hotkey']"
      [platform]="p['platform'] ?? 'auto'"
      [emptyMessage]="p['emptyMessage'] ?? 'No results found.'"
    ></uio-command-menu>
  `,
})
export class CommandMenuFixture {
  protected readonly p = parityProps();
}
