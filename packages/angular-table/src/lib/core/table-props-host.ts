import { Directive, ElementRef, Renderer2, effect, inject, type Signal } from "@angular/core";
import type { ElementProps } from "@ui-organized/table-core";
import { applyElementProps } from "./element-props.js";

/**
 * A part that applies core's prop bag to **its own host element**.
 *
 * `UioTableProps` is the directive for the ordinary case — a plain element in
 * someone's template, `<td [uioTableProps]="…">`. It cannot serve a component
 * that computes its own props, because `hostDirectives` exposes the input for
 * *binding* and a component has no way to bind an input to itself.
 *
 * So the parts that own their props extend this instead. Subclasses declare
 * `tableProps` as a `computed` and the effect below keeps the host in step,
 * diffing exactly as the directive does — see `applyElementProps` for why
 * diffing rather than assigning is load-bearing.
 */
@Directive()
export abstract class UioTablePropsHost {
  /** The bag this part puts on its own host element. */
  protected abstract readonly tableProps: Signal<ElementProps>;

  private readonly propsHost = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly propsRenderer = inject(Renderer2);

  constructor() {
    let applied = { attributes: new Set<string>(), styles: new Set<string>() };
    effect(() => {
      applied = applyElementProps(
        this.propsHost.nativeElement,
        this.propsRenderer,
        this.tableProps(),
        applied,
      );
    });
  }
}
