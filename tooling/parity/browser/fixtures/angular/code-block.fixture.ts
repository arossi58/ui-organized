import { Component } from "@angular/core";
import { UioCodeBlock } from "@ui-organized/angular";
import { fakeHighlight } from "../../../src/fixtures/codeHighlight.js";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `highlighted` stands for the `highlight` function; see cases/CodeBlock.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCodeBlock],
  template: `
    <div
      uioCodeBlock
      [code]="p['code']"
      [language]="p['language']"
      [title]="p['title']"
      [highlight]="p['highlighted'] ? highlight : undefined"
      [lineNumbers]="p['lineNumbers'] ?? false"
      [highlightLines]="p['highlightLines']"
      [wrap]="p['wrap'] ?? false"
      [maxHeight]="p['maxHeight']"
      [variant]="p['variant'] ?? 'default'"
      [diff]="p['diff'] ?? false"
      [copyable]="p['copyable'] ?? true"
      [copyLabel]="p['copyLabel'] ?? 'Copy'"
      [copiedLabel]="p['copiedLabel'] ?? 'Copied'"
    ></div>
  `,
})
export class CodeBlockFixture {
  protected readonly p = parityProps();
  protected readonly highlight = fakeHighlight;
}
