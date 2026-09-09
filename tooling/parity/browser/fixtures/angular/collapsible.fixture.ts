import { Component } from "@angular/core";
import {
  UioCollapsible,
  UioCollapsibleContent,
  UioCollapsibleTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `triggerLabel` and `body` are the *case's* props, not the root's: a compound
 * has to be assembled on both sides before anything can be compared, exactly as
 * the SSR fixture for the other three does it.
 *
 * `open` and `defaultOpen` collapse into one binding, for the reason
 * `UioSwitch` gives: a `model()` is uncontrolled until something binds it, so
 * `[open]` is an initial value the component still owns.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCollapsible, UioCollapsibleTrigger, UioCollapsibleContent],
  template: `
    <div
      uioCollapsible
      [open]="p['open'] ?? p['defaultOpen'] ?? false"
      [disabled]="!!p['disabled']"
      [class]="p['class'] ?? ''"
    >
      <button uioCollapsibleTrigger>{{ p['triggerLabel'] ?? 'Details' }}</button>
      <div uioCollapsibleContent>{{ p['body'] ?? 'Panel body' }}</div>
    </div>
  `,
})
export class CollapsibleFixture {
  protected readonly p = parityProps();
}
