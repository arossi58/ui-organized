import { Component } from "@angular/core";
import {
  UioFloatingPanel,
  UioFloatingPanelBody,
  UioFloatingPanelTitle,
  UioFloatingPanelTrigger,
} from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * The compound is assembled here on both sides, exactly as the SSR fixture for
 * the other three does it: trigger, title, close and body are separate elements
 * in every library, so the case supplies their props and the fixture the shape.
 *
 * `open` and `defaultOpen` collapse into one binding — a `model()` is
 * uncontrolled until something binds it, the fork `UioSwitch` describes.
 *
 * The close button is the component's own rather than a projected element, which
 * is what `UioDialog` does and for the same reason: React's `FloatingPanelClose`
 * supplies its own icon, and an Angular directive cannot.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  imports: [UioFloatingPanel, UioFloatingPanelTrigger, UioFloatingPanelTitle, UioFloatingPanelBody],
  template: `
    <button
      uioFloatingPanelTrigger
      [panel]="panel"
      [disabled]="!!triggerProps['disabled']"
      [class]="p['triggerClass'] ?? ''"
    >
      Open
    </button>
    <uio-floating-panel
      #panel="uioFloatingPanel"
      [open]="p['open'] ?? p['defaultOpen'] ?? false"
      [size]="contentProps['size'] ?? 'md'"
      [variant]="contentProps['variant'] ?? 'default'"
      [draggable]="p['draggable'] ?? true"
      [resizable]="p['resizable'] ?? true"
      [panelSize]="p['defaultSize'] ?? { width: 320, height: 240 }"
      [position]="p['defaultPosition'] ?? { x: 300, y: 100 }"
      [minSize]="p['minSize']"
      [maxSize]="p['maxSize']"
      [strategy]="p['strategy'] ?? 'fixed'"
    >
      <h2 uioFloatingPanelTitle>Title</h2>
      <div uioFloatingPanelBody>Body</div>
    </uio-floating-panel>
  `,
})
export class FloatingPanelFixture {
  protected readonly p = parityProps();
  protected readonly triggerProps = (this.p["triggerProps"] ?? {}) as Record<string, unknown>;
  protected readonly contentProps = (this.p["contentProps"] ?? {}) as Record<string, unknown>;
}
