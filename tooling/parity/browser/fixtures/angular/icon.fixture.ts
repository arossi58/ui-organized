import { Component, computed, inject } from "@angular/core";
import { UIO_ICON_CONFIG, UioIcon, type UioIconConfig } from "@ui-organized/angular";
import { DEFAULT_ICON_CONFIG } from "@ui-organized/core";
import { ANGULAR_ROOT, PARITY_PROPS, parityProps } from "./parity-props.js";
import { ANGULAR_STUB_SET } from "./icons.js";

/**
 * The `.icon-probe` wrapper is load-bearing for one case: `Icon` renders nothing
 * when the name is not in the set, and comparing nothing against nothing is a
 * case that cannot fail. With a wrapper the absence is asserted against
 * something that is definitely there.
 *
 * The config is a factory provider rather than a plain `provideIconConfig(...)`
 * call, because the case's `provider` object only exists at runtime and a
 * component's `providers` array is evaluated once. `provideIconConfig` itself
 * takes a signal for the same reason a real app would need one.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioIcon],
  providers: [
    {
      provide: UIO_ICON_CONFIG,
      useFactory: () => {
        const props = inject(PARITY_PROPS);
        return computed(
          () =>
            ({
              ...DEFAULT_ICON_CONFIG,
              icons: ANGULAR_STUB_SET,
              ...((props["provider"] as Partial<UioIconConfig> | undefined) ?? {}),
            }) as UioIconConfig,
        );
      },
    },
  ],
  template: `
    <div class="icon-probe">
      @if (p['supplied']) {
        <span uioIcon [svg]="SUPPLIED" [size]="p['size'] ?? 24"></span>
      } @else {
        <span
          uioIcon
          [name]="p['name']"
          [size]="p['size'] ?? 24"
          [label]="p['label']"
          [class]="p['class'] ?? ''"
        ></span>
      }
    </div>
  `,
})
export class IconFixture {
  protected readonly p = parityProps();
  /**
   * The directly-supplied path: no registry lookup and no adapter, so `Icon`
   * puts the size and stroke on as plain SVG attributes. The other three hand
   * over a component here; Angular hands over markup.
   */
  protected readonly SUPPLIED = `<svg data-cut="outline"></svg>`;
}
