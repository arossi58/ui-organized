import { Component } from "@angular/core";
import { UioTreeView } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The whole tree in one binding, because the tree is data in every library.
 *
 * Selection and expansion are `model()`s, so `selectedValue` and
 * `defaultSelectedValue` are the same input — see `splitter.fixture.ts` for the
 * same note.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioTreeView],
  template: `
    <div
      uioTreeView
      [items]="p['items'] ?? []"
      [label]="p['label']"
      [selectedValue]="p['selectedValue'] ?? p['defaultSelectedValue'] ?? []"
      [expandedValue]="p['expandedValue'] ?? p['defaultExpandedValue'] ?? []"
      [selectionMode]="p['selectionMode'] ?? 'single'"
      [size]="p['size'] ?? 'md'"
      [variant]="p['variant'] ?? 'default'"
      [showIndentGuides]="p['showIndentGuides'] ?? true"
    ></div>
  `,
})
export class TreeViewFixture {
  protected readonly p = parityProps();
}
