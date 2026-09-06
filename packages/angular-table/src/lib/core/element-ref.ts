import { Directive, ElementRef, effect, inject, input, type WritableSignal } from "@angular/core";

/**
 * Hand an element to a signal when it mounts, and `null` when it goes.
 *
 * React takes a callback ref for the root and the viewport; Vue binds a template
 * ref and watches it; Svelte uses an action. Angular has neither a per-element
 * ref callback nor a `viewChild` that can reach a **projected** node — and the
 * viewport is projected, because `<uio-table-viewport>` is written by the caller
 * inside `<uio-table>`. Writing into the api's own signal is what makes the
 * node's arrival reactive, which the resize and scroll observers need.
 *
 * ```html
 * <div [uioTableElementRef]="table.rootRef">
 * ```
 */
@Directive({
  selector: "[uioTableElementRef]",
  standalone: true,
})
export class UioTableElementRef {
  readonly target = input.required<WritableSignal<HTMLElement | null>>({
    alias: "uioTableElementRef",
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect((onCleanup) => {
      const target = this.target();
      target.set(this.host.nativeElement);
      onCleanup(() => target.set(null));
    });
  }
}
