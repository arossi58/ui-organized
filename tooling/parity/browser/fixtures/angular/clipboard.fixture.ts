import { Component } from "@angular/core";
import { UioClipboard } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * Only the idle state is compared here. Clicking the trigger rejects in a
 * headless browser — no clipboard permission — and React leaves that rejection
 * unhandled, so a scenario that copied would fail the gate's page-error
 * assertion on React rather than on any port. The copied state is asserted in
 * `clipboard.spec.ts` instead.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioClipboard],
  template: `
    <div
      uioClipboard
      [value]="p['value'] ?? ''"
      [label]="p['label']"
      [helperText]="p['helperText']"
      [variant]="p['variant'] ?? 'input'"
      [size]="p['size'] ?? 'md'"
      [copyLabel]="p['copyLabel'] ?? 'Copy'"
      [copiedLabel]="p['copiedLabel'] ?? 'Copied'"
      [timeout]="p['timeout'] ?? 3000"
    ></div>
  `,
})
export class ClipboardFixture {
  protected readonly p = parityProps();
}
