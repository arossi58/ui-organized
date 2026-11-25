import { Component } from "@angular/core";
import { UioAttachment } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioAttachment],
  template: `
    <div
      uioAttachment
      [name]="p['name']"
      [size]="p['size']"
      [status]="p['status'] ?? 'done'"
      [progress]="p['progress']"
      [error]="p['error']"
      [href]="p['href']"
      [variant]="p['variant'] ?? 'row'"
      [removable]="!!p['removable']"
      [retryable]="!!p['retryable']"
      [removeLabel]="p['removeLabel']"
      [retryLabel]="p['retryLabel']"
    ></div>
  `,
})
export class AttachmentFixture {
  protected readonly p = parityProps();
}
