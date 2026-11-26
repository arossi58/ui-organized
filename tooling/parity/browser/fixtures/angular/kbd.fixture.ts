import { Component } from "@angular/core";
import { UioKbd } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `text` stands for the children; see cases/Kbd.tsx. Angular projects it. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioKbd],
  template: `<kbd
    uioKbd
    [keys]="p['keys']"
    [size]="p['size'] ?? 'md'"
    [platform]="p['platform'] ?? 'auto'"
    >{{ p["text"] }}</kbd
  >`,
})
export class KbdFixture {
  protected readonly p = parityProps();
}
