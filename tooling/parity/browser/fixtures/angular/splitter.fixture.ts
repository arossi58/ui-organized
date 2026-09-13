import { Component } from "@angular/core";
import { UioSplitter } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Panel content is a plain string in every library's case — see the SSR spec
 * for why that is the one value all four accept unchanged.
 *
 * `size` and `defaultSize` are one input here: `model()` is uncontrolled until
 * something binds it, so the controlled/uncontrolled fork React implements by
 * hand does not arise. The fixture takes whichever the scenario supplied.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSplitter],
  template: `
    <div
      uioSplitter
      [panels]="p['panels'] ?? []"
      [size]="p['size'] ?? p['defaultSize']"
      [orientation]="p['orientation'] ?? 'horizontal'"
      [variant]="p['variant'] ?? 'default'"
    ></div>
  `,
})
export class SplitterFixture {
  protected readonly p = parityProps();
}
