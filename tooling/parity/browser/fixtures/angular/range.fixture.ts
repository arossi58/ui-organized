import { Component } from "@angular/core";
import { UioRange } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `value` and `defaultValue` collapse into one binding — see `UioSwitch` — so
 * the scenario's spelling of "where the thumb starts" reaches the same input
 * either way.
 *
 * `formatValue` has no binding here on purpose: it is a function, and the
 * scenario's props travel to the page as JSON in a query string. The formatted
 * readout is the SSR gate's to cover.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioRange],
  template: `
    <div
      uioRange
      [label]="p['label']"
      [value]="p['value'] ?? p['defaultValue']"
      [min]="p['min'] ?? 0"
      [max]="p['max'] ?? 100"
      [step]="p['step'] ?? 1"
      [snapValues]="p['snapValues']"
      [rangeLabels]="!!p['rangeLabels']"
      [startLabel]="p['startLabel']"
      [endLabel]="p['endLabel']"
      [size]="p['size'] ?? 'md'"
      [error]="p['error']"
      [disabled]="!!p['disabled']"
      [hideValue]="!!p['hideValue']"
      [name]="p['name']"
      [aria-label]="p['aria-label']"
      [class]="p['class'] ?? ''"
    ></div>
  `,
})
export class RangeFixture {
  protected readonly p = parityProps();
}
