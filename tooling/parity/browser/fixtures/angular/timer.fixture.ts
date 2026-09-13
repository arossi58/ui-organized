import { Component } from "@angular/core";
import { UioTimer, type TimerPart } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

const DEFAULT_PARTS: TimerPart[] = ["hours", "minutes", "seconds"];

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTimer],
  template: `
    <div
      uioTimer
      [parts]="parts"
      [countdown]="!!p['countdown']"
      [startMs]="p['startMs'] ?? 0"
      [targetMs]="p['targetMs']"
      [autoStart]="!!p['autoStart']"
      [interval]="p['interval'] ?? 1000"
      [showControls]="!!p['showControls']"
      [showLabels]="!!p['showLabels']"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class TimerFixture {
  protected readonly p = parityProps();
  /** Read once — a fresh array per check is a changed input. See AngleSliderFixture. */
  protected readonly parts: readonly TimerPart[] = this.p["parts"] ?? DEFAULT_PARTS;
}
