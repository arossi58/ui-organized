import {
  DOCUMENT,
  Directive,
  ElementRef,
  afterEveryRender,
  inject,
  input,
} from "@angular/core";
import { UioMenubarContext } from "./menubar-context.js";

export type MenubarOrientation = "horizontal" | "vertical";

/** How the bar finds its own triggers. Written by `UioMenuTrigger` when it finds this bar. */
const ITEM = "[data-menubar-item]";

/**
 * A row of menus that behaves as one control.
 *
 * ```html
 * <div uioMenubar>
 *   <button uioMenuTrigger [menu]="file" class="menubar__trigger">File</button>
 *   <uio-menu #file="uioMenu">
 *     <div uioMenuItem value="new">New</div>
 *   </uio-menu>
 *
 *   <button uioMenuTrigger [menu]="edit" class="menubar__trigger">Edit</button>
 *   <uio-menu #edit="uioMenu">
 *     <div uioMenuItem value="undo">Undo</div>
 *   </uio-menu>
 * </div>
 * ```
 *
 * Ark UI has no Menubar primitive and the menus inside are independent overlays,
 * so the bar supplies the part a menubar owns and a lone menu cannot: its
 * triggers are menuitems (see {@link UioMenubarContext}) and arrow keys move
 * between them as one tab stop. Opening a menu and navigating within it is still
 * each menu's own business.
 *
 * Like `UioToolbar` it does **not** extend `UioPart` — no library has a machine
 * behind the bar itself, so no `data-scope`/`data-part` belongs on it — while
 * `data-orientation` is bound directly because `Menubar.css` switches the flex
 * direction on it.
 *
 * ── Why the roving tabindex is written onto the DOM ─────────────────────────
 *
 * A menubar is a single tab stop: exactly one trigger is `tabindex="0"` and the
 * rest are `-1`, and the arrow keys move both the focus and that zero. The
 * triggers belong to separate `UioMenu`s that the bar has no handle on, and they
 * are the caller's own elements rather than anything this directive renders, so
 * there is no binding to drive — the attribute is set imperatively, exactly as
 * React does it from an effect and Vue from `onMounted`/`onUpdated`.
 *
 * `[data-menubar-item]`, not `[role="menuitem"]`: a menu whose content is
 * rendered *into* the bar — a docs preview containing its own overlays — would
 * otherwise put that menu's own items in range, and Home would jump into a
 * dropdown.
 */
@Directive({
  selector: "div[uioMenubar]",
  standalone: true,
  providers: [UioMenubarContext],
  host: {
    class: "menubar",
    role: "menubar",
    "[attr.aria-orientation]": "orientation()",
    "[attr.data-orientation]": "orientation()",
    "(keydown)": "onKeydown($event)",
    "(focusin)": "onFocusin($event)",
  },
})
export class UioMenubar {
  readonly orientation = input<MenubarOrientation>("horizontal");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Injected rather than global, like every other part of this library. */
  private readonly document = inject(DOCUMENT);

  constructor() {
    /**
     * `afterEveryRender`, not a one-shot hook: a menu added to the bar arrives
     * with the browser's default tabindex and would become a second tab stop.
     * React re-runs its effect on `children` and Vue re-roves in `onUpdated` for
     * the same reason. The work is a `querySelectorAll` over a handful of
     * triggers, and it writes DOM properties that no binding owns, so it cannot
     * loop change detection.
     */
    afterEveryRender(() => this.rove());
  }

  private triggers(): HTMLElement[] {
    return [...this.host.nativeElement.querySelectorAll<HTMLElement>(ITEM)];
  }

  /**
   * Make `focused` the bar's single tab stop, defaulting to whichever trigger
   * already holds it and falling back to the first.
   *
   * Keeping the existing zero matters: re-roving on every render would otherwise
   * drag the tab stop back to "File" every time anything in the bar re-rendered,
   * including the menu the user had just arrowed to and opened.
   */
  private rove(focused?: HTMLElement): void {
    const items = this.triggers();
    const active = focused ?? items.find((item) => item.tabIndex === 0) ?? items[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  }

  protected onKeydown(event: KeyboardEvent): void {
    // A caller's own handler is bound on their element and runs first; if it
    // handled the key itself, the bar leaves it alone.
    if (event.defaultPrevented) return;

    const [back, forward] =
      this.orientation() === "vertical"
        ? ["ArrowUp", "ArrowDown"]
        : ["ArrowLeft", "ArrowRight"];
    const items = this.triggers();
    const from = items.indexOf(this.document.activeElement as HTMLElement);
    // -1 means focus is inside an *open menu* rather than on a trigger, where
    // the arrow keys belong to that menu. Swallowing them here would break
    // navigation within every dropdown in the bar.
    if (from === -1 || items.length === 0) return;

    let to: number;
    if (event.key === forward) to = (from + 1) % items.length;
    else if (event.key === back) to = (from - 1 + items.length) % items.length;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = items.length - 1;
    else return;

    event.preventDefault();
    const next = items[to];
    if (!next) return;
    this.rove(next);
    next.focus();
  }

  /**
   * `focusin`, not `focus`.
   *
   * React's `onFocus` is its own synthetic event and *does* bubble, so the DOM
   * equivalent of the handler being ported is the bubbling one. A `focus`
   * listener on the bar fires only when the bar itself is focused and would
   * never see a trigger — the tab stop would then stay wherever it was last put,
   * and tabbing into the bar would leave the wrong trigger as the tab stop.
   */
  protected onFocusin(event: FocusEvent): void {
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>(ITEM);
    if (item) this.rove(item);
  }
}
