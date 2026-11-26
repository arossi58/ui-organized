import { Component } from "@angular/core";
import {
  UioPageHeader,
  UioPageHeaderActions,
  UioPageHeaderBreadcrumbs,
  UioPageHeaderTabs,
  UioSectionFooter,
  UioSectionFooterActions,
  UioSectionFooterContent,
  UioSectionHeader,
  UioSectionHeaderActions,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/** The `with*` flags stand for the slots; see cases/PageHeader.tsx. */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioPageHeader, UioPageHeaderBreadcrumbs, UioPageHeaderActions, UioPageHeaderTabs],
  template: `
    <div
      uioPageHeader
      [title]="p['title']"
      [description]="p['description']"
      [size]="p['size'] ?? 'md'"
      [headingLevel]="p['headingLevel'] ?? 1"
      [divided]="p['divided'] ?? false"
    >
      @if (p["withBreadcrumbs"]) {
        <div uioPageHeaderBreadcrumbs><a href="/">Home</a></div>
      }
      @if (p["withActions"]) {
        <div uioPageHeaderActions><button type="button">Edit</button></div>
      }
      @if (p["withTabs"]) {
        <div uioPageHeaderTabs><div>Overview</div></div>
      }
    </div>
  `,
})
export class PageHeaderFixture {
  protected readonly p = parityProps();
}

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSectionHeader, UioSectionHeaderActions],
  template: `
    <div
      uioSectionHeader
      [title]="p['title']"
      [description]="p['description']"
      [size]="p['size'] ?? 'md'"
      [align]="p['align'] ?? 'start'"
      [headingLevel]="p['headingLevel'] ?? 2"
      [divided]="p['divided'] ?? false"
    >
      @if (p["withActions"]) {
        <div uioSectionHeaderActions><button type="button">View all</button></div>
      }
    </div>
  `,
})
export class SectionHeaderFixture {
  protected readonly p = parityProps();
}

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioSectionFooter, UioSectionFooterContent, UioSectionFooterActions],
  template: `
    <div uioSectionFooter [divided]="p['divided'] ?? false">
      @if (p["text"]) {
        <div uioSectionFooterContent>{{ p["text"] }}</div>
      }
      @if (p["withActions"]) {
        <div uioSectionFooterActions><button type="button">Next</button></div>
      }
    </div>
  `,
})
export class SectionFooterFixture {
  protected readonly p = parityProps();
}
