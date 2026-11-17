import { Component, DestroyRef, inject, signal } from "@angular/core";
import { UioCombobox, type ComboboxOption } from "@ui-organized/angular";
import { OPTIONS_ARRIVE_AFTER } from "../comboboxAsync.js";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The value first, the options later. See `comboboxAsync.ts`, and
 * `combobox.fixture.ts` for why `[value]` stands in for `defaultValue`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioCombobox],
  template: `
    <div
      uioCombobox
      [options]="loaded()"
      [label]="p['label']"
      [placeholder]="p['placeholder']"
      [value]="p['defaultValue'] ?? p['value']"
    ></div>
  `,
})
export class ComboboxAsyncFixture {
  protected readonly p = parityProps();
  protected readonly loaded = signal<ComboboxOption[]>([]);

  constructor() {
    const timer = setTimeout(() => this.loaded.set(this.p["options"] ?? []), OPTIONS_ARRIVE_AFTER);
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  }
}
