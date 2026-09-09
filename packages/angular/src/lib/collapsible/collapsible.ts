import {
  ApplicationRef,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
  type OnInit,
  type Signal,
} from "@angular/core";
import { UioPart } from "../part.js";
import { flushNow } from "../overlay/flush.js";
import { UioCollapsibleContext } from "./collapsible-context.js";

/**
 * One section that opens and closes.
 *
 * ```html
 * <div uioCollapsible [(open)]="showing">
 *   <button uioCollapsibleTrigger>Details</button>
 *   <div uioCollapsibleContent>…</div>
 * </div>
 * ```
 *
 * A compound rather than `Accordion`'s data-driven shape, because the panel
 * holds arbitrary content and an accordion's holds a row of items: handing a
 * caller `content: TemplateRef` for a single disclosure would be a wrapper
 * around `<ng-content>` and nothing else.
 *
 * `open` is a `model()`, so it is uncontrolled until something binds it and
 * React's `open`/`defaultOpen` fork does not arise — see `UioSwitch`.
 *
 * The animation, and the panel attribute that is deliberately absent while it is
 * settled open, are in `UioCollapsibleContext`.
 */
@Component({
  selector: "div[uioCollapsible]",
  standalone: true,
  exportAs: "uioCollapsible",
  providers: [UioCollapsibleContext],
  template: `<ng-content />`,
  host: {
    class: "collapsible",
    "[id]": "ctx.rootId",
  },
})
export class UioCollapsible extends UioPart implements OnInit {
  readonly scope = "collapsible";
  readonly part = "root";

  readonly open = model(false);
  readonly openChange = output<boolean>();

  /**
   * Not an override of the base's `disabled`, deliberately.
   *
   * `UioPart` binds `data-disabled` from that signal, and Ark's collapsible
   * **root** reports no such attribute — only the trigger and the panel do.
   * Same split, for the same reason, as `UioAccordion`'s.
   */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });

  protected readonly ctx = inject(UioCollapsibleContext);
  private readonly appRef = inject(ApplicationRef);

  /**
   * Wrapped rather than handed to the context directly, so the parts read *the
   * input* rather than the signal object that happened to exist when the root
   * was constructed.
   *
   * A captured reference is a live bug in one place and a dead spec in another:
   * JIT registers no initializer-based input, so every TestBed spec in this
   * package replaces an input wholesale after construction — and a trigger
   * holding the original would report a disabled state the root does not have.
   * The wrapper is lazy, so its first read is the first render.
   */
  private readonly disabledState = computed(() => this.disabledInput());

  /**
   * The root reports the *machine's* state, not the model's: a panel on its way
   * out is already `closed` here while it is still on screen animating.
   */
  override readonly state: Signal<"open" | "closed"> = this.ctx.state;

  /**
   * What the model was last seen holding, so the effect below can tell an
   * external change from its own write. `null` until `ngOnInit` seeds it.
   */
  private lastOpen: boolean | null = null;

  constructor() {
    super();
    this.ctx.bind({ disabled: this.disabledState, request: (open) => this.set(open) });
    effect(() => {
      const open = this.open();
      if (this.lastOpen === null || open === this.lastOpen) return;
      this.lastOpen = open;
      untracked(() => this.ctx.setOpen(open));
    });
  }

  /**
   * `ngOnInit` rather than the effect's first run, because an effect lands after
   * the first change-detection pass: a collapsible that starts open would render
   * closed for one frame and then animate itself open on mount, which is a flash
   * no other library has.
   */
  ngOnInit(): void {
    this.lastOpen = this.open();
    this.ctx.seed(this.lastOpen);
  }

  private set(open: boolean): void {
    if (open === this.open()) return;
    this.lastOpen = open;
    this.open.set(open);
    this.openChange.emit(open);
    this.ctx.setOpen(open);
    flushNow(this.appRef);
  }
}

/**
 * The button that opens and closes the panel.
 *
 * ── No native `disabled` ────────────────────────────────────────────────────
 *
 * A disabled collapsible's trigger carries `data-disabled` and stays focusable:
 * Zag's connect puts no `disabled` on it and refuses the click in the handler
 * instead. That is the rendered contract in all three other libraries, so it is
 * the one reproduced here — adding the native attribute would look like an
 * improvement and would take the trigger out of the tab order in one library
 * only.
 */
@Component({
  selector: "button[uioCollapsibleTrigger]",
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: "collapsible__trigger text-emphasis-body-large",
    type: "button",
    "[id]": "ctx.partId('trigger')",
    "[attr.aria-controls]": "ctx.partId('content')",
    "[attr.aria-expanded]": "ctx.visible()",
    "(click)": "toggle()",
  },
})
export class UioCollapsibleTrigger extends UioPart {
  readonly scope = "collapsible";
  readonly part = "trigger";

  protected readonly ctx = inject(UioCollapsibleContext);
  override readonly state: Signal<"open" | "closed"> = this.ctx.state;
  override readonly disabled: Signal<boolean> = this.ctx.disabled;

  protected toggle(): void {
    if (this.ctx.disabled()) return;
    this.ctx.request(!this.ctx.open());
  }
}

/**
 * The region the trigger reveals.
 *
 * Two elements, not one: the panel is the animating box and has to keep
 * `overflow: hidden` and no padding of its own, so `.collapsible__content`
 * inside it is what carries the spacing. The other three libraries nest the
 * same pair.
 *
 * `data-collapsible` is Ark's marker for "this is a collapsible panel" and is
 * present open or closed.
 */
@Component({
  selector: "div[uioCollapsibleContent]",
  standalone: true,
  template: `<div class="collapsible__content"><ng-content /></div>`,
  host: {
    class: "collapsible__panel",
    "data-collapsible": "",
    "[id]": "ctx.partId('content')",
    "[attr.hidden]": "ctx.visible() ? null : ''",
  },
})
export class UioCollapsibleContent extends UioPart {
  readonly scope = "collapsible";
  readonly part = "content";

  protected readonly ctx = inject(UioCollapsibleContext);
  /** `null` while settled open — see `UioCollapsibleContext`. */
  override readonly state: Signal<"open" | "closed" | null> = this.ctx.contentState;
  override readonly disabled: Signal<boolean> = this.ctx.disabled;

  constructor() {
    super();
    this.ctx.bindContent(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  }
}
