import { Component } from "@angular/core";
import {
  UioMenu,
  UioMenuCheckboxItem,
  UioMenuGroup,
  UioMenuGroupLabel,
  UioMenuRadioGroup,
  UioMenuRadioItem,
  UioMenuTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT } from "./parity-props.js";

/**
 * The parts a menu needs to *be* a view-options or sort menu: a named group, two
 * checkbox items, and a radio group with one of its items chosen.
 *
 * Angular's surface is the menu element itself, so there is no content part to
 * wrap the groups in — see `menu.fixture.ts`.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [
    UioMenu,
    UioMenuTrigger,
    UioMenuGroup,
    UioMenuGroupLabel,
    UioMenuCheckboxItem,
    UioMenuRadioGroup,
    UioMenuRadioItem,
  ],
  template: `
    <button uioMenuTrigger [menu]="m">Open</button>
    <uio-menu #m="uioMenu">
      <div uioMenuGroup>
        <div uioMenuGroupLabel>Columns</div>
        <div uioMenuCheckboxItem value="name" [checked]="true">Name</div>
        <div uioMenuCheckboxItem value="email">Email</div>
      </div>
      <div uioMenuRadioGroup value="asc">
        <div uioMenuGroupLabel>Direction</div>
        <div uioMenuRadioItem value="asc">Ascending</div>
        <div uioMenuRadioItem value="desc">Descending</div>
      </div>
    </uio-menu>
  `,
})
export class MenuOptionsFixture {}
