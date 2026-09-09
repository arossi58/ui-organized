import { Component } from "@angular/core";
import { UioNavItem, UioSidebar, type NavSubItem } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * A whole sidebar rather than an item on its own, because the thing most likely
 * to drift is what the container tells its descendants: the rail travels on an
 * injected context, and an item that ignored it would render a full-width label
 * inside a 56px column with nothing else visibly wrong.
 *
 * Two shape differences from React, neither of them a difference in output.
 * React takes `logo` and `footer` as nodes and Angular as `string | TemplateRef`
 * — every case passes a string. And React's sub-items are `NavSubItem` elements
 * placed as children where Angular's are data on the item; see the note on
 * `NavSubItem` for why a content query cannot answer "am I expandable" in time.
 *
 * `defaultCollapsed` and `collapsed` both land on `[collapsed]`: a `model()` is
 * uncontrolled until something binds it, so the fork React implements by hand
 * does not arise.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSidebar, UioNavItem],
  template: `
    <div
      uioSidebar
      [logo]="p['logo']"
      [footer]="p['footer']"
      [navLabel]="p['navLabel'] ?? 'Primary'"
      [collapsible]="!!p['collapsible']"
      [collapsed]="p['collapsed'] ?? p['defaultCollapsed'] ?? false"
    >
      <div uioNavItem label="Home" icon="check" selected></div>
      <div
        uioNavItem
        label="Reports"
        icon="check"
        [subItems]="subItems"
        [expanded]="!!item['defaultExpanded']"
        [disabled]="!!item['disabled']"
      ></div>
    </div>
  `,
})
export class NavigationFixture {
  protected readonly p = parityProps();
  protected readonly item = (this.p["itemProps"] ?? {}) as Record<string, any>;
  protected readonly subItems: NavSubItem[] = [
    { label: "Weekly" },
    { label: "Monthly", selected: true },
  ];
}
