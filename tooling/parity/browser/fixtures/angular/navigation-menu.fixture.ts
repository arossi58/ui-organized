import { Component } from "@angular/core";
import {
  UioNavigationMenu,
  UioNavigationMenuItem,
  UioNavigationMenuLink,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The tree `items` describes; see cases/NavigationMenu.tsx. `defaultValue`
 * seeds `value`, which is a model here as in Vue.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioNavigationMenu, UioNavigationMenuItem, UioNavigationMenuLink],
  template: `
    <nav
      uioNavigationMenu
      [attr.aria-label]="p['aria-label'] ?? null"
      [value]="p['defaultValue'] ?? ''"
      [openDelay]="p['openDelay'] ?? 200"
      [closeDelay]="p['closeDelay'] ?? 300"
    >
      @for (item of p["items"]; track item.value) {
        @if (item.router) {
          <div uioNavigationMenuItem [value]="item.value">
            <a uioNavigationMenuLink href="/router">{{ item.label }}</a>
          </div>
        } @else {
          <div
            uioNavigationMenuItem
            [value]="item.value"
            [label]="item.label"
            [href]="item.href"
            [current]="item.current ?? false"
            [disabled]="item.disabled ?? false"
            [columns]="item.columns ?? 1"
          >
            @for (link of item.links ?? []; track link.href) {
              <a
                uioNavigationMenuLink
                [href]="link.href"
                [icon]="link.icon"
                [description]="link.description"
                [current]="link.current ?? false"
                >{{ link.title }}</a
              >
            }
          </div>
        }
      }
    </nav>
  `,
})
export class NavigationMenuFixture {
  protected readonly p = parityProps();
}
