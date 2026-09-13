import { Component } from "@angular/core";
import { UioCard, UioCardBody, UioCardFooter, UioCardHeader } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCard, UioCardHeader, UioCardBody, UioCardFooter],
  template: `
    <div uioCard [variant]="p['variant'] ?? 'default'" [padding]="p['padding'] ?? 'md'">
      <div uioCardHeader>Header</div>
      <div uioCardBody>Body</div>
      <div uioCardFooter>Footer</div>
    </div>
  `,
})
export class CardFixture {
  protected readonly p = parityProps();
}
