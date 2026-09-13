import { Component } from "@angular/core";
import { UioToggle, UioToggleGroup } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * `items` is what switches the case from the standalone toggle to the group, the
 * same discriminator the SSR fixture uses.
 *
 * The two branches render *different Ark parts* — `toggle`/`root` against
 * `toggle-group`/`item` — and in Angular that is decided by whether the button
 * finds a group provider rather than by whether it was given a `value`. Which is
 * why the group branch below nests the buttons: put them outside the `<div>` and
 * they would be standalone toggles with a stray `value`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioToggle, UioToggleGroup],
  template: `
    @if (p['items']; as items) {
      <div
        uioToggleGroup
        [value]="p['defaultValue'] ?? p['value'] ?? []"
        [multiple]="!!p['multiple']"
        [disabled]="!!p['disabled']"
        [orientation]="p['orientation'] ?? 'horizontal'"
      >
        @for (item of items; track item.value) {
          <button
            uioToggle
            [value]="item.value"
            [label]="item.label"
            [disabled]="!!item.disabled"
          ></button>
        }
      </div>
    } @else {
      <button
        uioToggle
        [label]="p['label']"
        [icon]="p['icon']"
        [size]="p['size'] ?? 'md'"
        [pressed]="!!(p['pressed'] ?? p['defaultPressed'])"
        [disabled]="!!p['disabled']"
        [class]="p['class'] ?? ''"
      ></button>
    }
  `,
})
export class ToggleFixture {
  protected readonly p = parityProps();
}
