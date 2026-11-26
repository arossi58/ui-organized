import { Component } from "@angular/core";
import { UioStat, UioStatChart } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `chart` stands for the projected chart; see cases/Stat.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioStat, UioStatChart],
  template: `
    <div
      uioStat
      [label]="p['label']"
      [value]="p['value']"
      [delta]="p['delta']"
      [trend]="p['trend']"
      [sentiment]="p['sentiment']"
      [trendLabel]="p['trendLabel']"
      [description]="p['description']"
      [variant]="p['variant'] ?? 'card'"
      [size]="p['size'] ?? 'md'"
    >
      @if (p["chart"]) {
        <div uioStatChart><span class="parity-chart">Chart</span></div>
      }
    </div>
  `,
})
export class StatFixture {
  protected readonly p = parityProps();
}
