import { Component } from "@angular/core";
import { UioDescriptionList, UioDescriptionListItem } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `composed` stands for the projected items; see cases/DescriptionList.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioDescriptionList, UioDescriptionListItem],
  template: `
    <dl
      uioDescriptionList
      [items]="p['items'] ?? []"
      [layout]="p['layout'] ?? 'inline'"
      [size]="p['size'] ?? 'md'"
      [divided]="p['divided'] ?? false"
    >
      @if (p["composed"]) {
        <div uioDescriptionListItem term="Owner">Ada Lovelace</div>
        <div uioDescriptionListItem term="Region">Europe (west)</div>
      }
    </dl>
  `,
})
export class DescriptionListFixture {
  protected readonly p = parityProps();
}
