import { Component } from "@angular/core";
import { UioButton, UioTag } from "@ui-organized/angular";
@Component({ selector: "app-panel", imports: [UioButton, UioTag], template: `
  <button uioButton [intent]="'ghost'" [shout]="true">Go</button>
  <span uioTag variant="caution">Hi</span>
` })
export class Panel {}
