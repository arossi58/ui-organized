import { Component } from "@angular/core";
import {
  UioAppHeader,
  UioAppHeaderActions,
  UioAppHeaderLogo,
  UioAppHeaderNav,
  UioAppShell,
  UioAppShellSidebar,
  UioNavItem,
  UioSidebar,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `header` and `sidebar` stand for projected content; see cases/AppShell.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioAppShell,
    UioAppShellSidebar,
    UioAppHeader,
    UioAppHeaderLogo,
    UioAppHeaderNav,
    UioAppHeaderActions,
    UioSidebar,
    UioNavItem,
  ],
  template: `
    <div
      uioAppShell
      [layout]="p['layout'] ?? 'auto'"
      [breakpoint]="p['breakpoint'] ?? 900"
      [scroll]="p['scroll'] ?? 'page'"
      [mainId]="p['mainId']"
      [skipLinkLabel]="p['skipLinkLabel'] ?? 'Skip to content'"
    >
      @if (p["header"]; as header) {
        <header uioAppHeader>
          @if (header.logo) {
            <div uioAppHeaderLogo><span class="parity-logo">Acme</span></div>
          }
          @if (header.nav) {
            <div uioAppHeaderNav><span class="parity-nav">Nav</span></div>
          }
          @if (header.actions) {
            <div uioAppHeaderActions><button type="button">Sign in</button></div>
          }
        </header>
      }
      @if (p["sidebar"]) {
        <ng-template uioAppShellSidebar>
          <div uioSidebar>
            <div uioNavItem label="Reports"></div>
            <div uioNavItem label="Settings"></div>
          </div>
        </ng-template>
      }
      <p>Page</p>
    </div>
  `,
})
export class AppShellFixture {
  protected readonly p = parityProps();
}
