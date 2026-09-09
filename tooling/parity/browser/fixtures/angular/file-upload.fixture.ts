import { Component } from "@angular/core";
import { UioFileUpload } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * There is no `value` binding here and there cannot be one: the chosen files
 * are `File` objects, which a scenario's JSON props have no way to express. The
 * populated rows are reached by driving the hidden input instead.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioFileUpload],
  template: `
    <div
      uioFileUpload
      [label]="p['label']"
      [helperText]="p['helperText']"
      [error]="p['error']"
      [accept]="p['accept']"
      [maxFiles]="p['maxFiles'] ?? 1"
      [maxFileSize]="p['maxFileSize']"
      [minFileSize]="p['minFileSize']"
      [allowDrop]="p['allowDrop'] ?? true"
      [directory]="!!p['directory']"
      [dropzoneLabel]="p['dropzoneLabel'] ?? 'Drag files here, or'"
      [triggerLabel]="p['triggerLabel'] ?? 'Choose files'"
      [variant]="p['variant'] ?? 'dropzone'"
      [size]="p['size'] ?? 'md'"
      [showPreview]="p['showPreview'] ?? true"
      [required]="!!p['required']"
      [disabled]="!!p['disabled']"
      [name]="p['name']"
    ></div>
  `,
})
export class FileUploadFixture {
  protected readonly p = parityProps();
}
