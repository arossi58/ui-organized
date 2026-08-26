import { ElementRef, inject } from "@angular/core";

/**
 * Take a component's own host element out of the DOM, and put it back.
 *
 * Several components in this library render **nothing** in some state — `Icon`
 * with a name its set does not have, `FieldError` with an empty message. In the
 * other three libraries that is a `return null` and no element exists. An
 * Angular directive cannot decline to render the element the caller wrote, so it
 * removes it instead.
 *
 * That has to be reversible. A one-way removal makes
 * `<span uioFieldError [message]="error()">` permanently dead the first time
 * `error()` is empty — which is its *initial* state on every form. So the
 * position is remembered rather than the element merely detached, and `show()`
 * puts it back where it was rather than at the end of its parent.
 *
 * Leaving an empty element behind is not an option: `.icon` and `.field-error`
 * both carry layout, and an empty one holds space in a row that has none in the
 * other three libraries.
 */
export class HostPresence {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private removed: { parent: Node; before: Node | null } | null = null;

  hide(): void {
    const element = this.host.nativeElement;
    const parent = element.parentNode;
    if (!parent || this.removed) return;
    this.removed = { parent, before: element.nextSibling };
    parent.removeChild(element);
  }

  show(): void {
    if (!this.removed) return;
    const { parent, before } = this.removed;
    this.removed = null;
    parent.insertBefore(this.host.nativeElement, before);
  }

  set(present: boolean): void {
    if (present) this.show();
    else this.hide();
  }
}
