import { Component } from "@angular/core";
import { UioFieldError } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioFieldError],
  template: `<span uioFieldError [message]="p['message']"></span>`,
})
export class FieldErrorFixture {
  protected readonly p = parityProps();
}
