import { Component } from "@angular/core";
import {
  UioItem,
  UioItemActions,
  UioItemGroup,
  UioItemLink,
  UioItemMedia,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** `media`, `actions` and `router` stand for projected content; see cases/Item.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioItem, UioItemMedia, UioItemActions, UioItemLink],
  template: `
    <div
      uioItem
      [title]="p['title']"
      [description]="p['description']"
      [icon]="p['icon']"
      [href]="p['href']"
      [target]="p['target']"
      [rel]="p['rel']"
      [variant]="p['variant'] ?? 'plain'"
      [size]="p['size'] ?? 'md'"
      [headingLevel]="p['headingLevel']"
      [titleId]="p['titleId']"
      [descriptionId]="p['descriptionId']"
    >
      @if (p["media"]) {
        <div uioItemMedia><span class="parity-media">AB</span></div>
      }
      @if (p["router"]) {
        <a uioItemLink href="/router">{{ p["title"] }}</a>
      }
      @if (p["actions"]) {
        <div uioItemActions><button type="button">Edit</button></div>
      }
    </div>
  `,
})
export class ItemFixture {
  protected readonly p = parityProps();
}

/** Two fixed rows; see cases/ItemGroup.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioItem, UioItemGroup],
  template: `
    <div uioItemGroup [variant]="p['variant'] ?? 'plain'" [divided]="p['divided'] ?? true">
      <div
        uioItem
        [variant]="p['itemVariant'] ?? 'plain'"
        title="Product updates"
        description="News about releases."
      ></div>
      <div
        uioItem
        [variant]="p['itemVariant'] ?? 'plain'"
        title="Weekly digest"
        href="/digest"
      ></div>
    </div>
  `,
})
export class ItemGroupFixture {
  protected readonly p = parityProps();
}
