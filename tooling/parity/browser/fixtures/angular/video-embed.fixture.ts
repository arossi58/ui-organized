import { Component } from "@angular/core";
import { UioVideoEmbed } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioVideoEmbed],
  template: `
    <div
      uioVideoEmbed
      [src]="p['src']"
      [title]="p['title']"
      [poster]="p['poster']"
      [type]="p['type']"
      [aspectRatio]="p['aspectRatio']"
      [lightbox]="!!p['lightbox']"
      [background]="!!p['background']"
      [playLabel]="p['playLabel']"
    ></div>
  `,
})
export class VideoEmbedFixture {
  protected readonly p = parityProps();
}
