import { NgTemplateOutlet } from "@angular/common";
import {
  ApplicationRef,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { accordionStyles, type AccordionVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { flushNow } from "../overlay/flush.js";
import { moveHighlight } from "../overlay/roving.js";

export type AccordionVariant = NonNullable<AccordionVariants["variant"]>;
export type AccordionSize = NonNullable<AccordionVariants["size"]>;

export interface AccordionItem {
  /** Identifies the item. Coerced to a string at the boundary, as Zag does. */
  value: string | number;
  title: string;
  /** A string, or a template for anything richer — see `TabItem.content`. */
  content?: string | TemplateRef<unknown>;
  disabled?: boolean;
}

/** The chevron, at the size the other three libraries ask Icon for. */
const ICON_SIZE = 20;

/**
 * A stack of sections that open and close.
 *
 * ```html
 * <div uioAccordion [items]="sections" [(value)]="open"></div>
 * ```
 *
 * ── Three things Ark renders that the JSX does not show ─────────────────────
 *
 * **The item's id is prefixed `collapsible:`.** Ark builds each accordion item
 * out of a Collapsible root and hands it the accordion's item id as its
 * *machine* id, so the element comes out as
 * `collapsible:accordion:<machine>:item:<value>`. It looks like a typo and it is
 * the contract — reproduced here rather than tidied, because ids are compared
 * across all four libraries by shape.
 *
 * **The trigger names its panel twice.** `aria-controls` is the reference;
 * `data-controls` is how a sibling finds the panel without reading ARIA. Both
 * are present whether the item is open or closed.
 *
 * **An open panel reports no `data-state` at all.** Zag's collapsible drops it
 * once the enter transition has finished (`skip = !initial && open`), so a
 * settled open panel carries `data-collapsible` and nothing else, while a closed
 * one carries `data-state="closed"` and `hidden`. `.accordion__panel` styles
 * neither, so nothing renders differently — but the parity gate compares
 * attributes, not appearance, and emitting a helpful `data-state="open"` here
 * would be a difference from all three other libraries.
 *
 * ── What is not reproduced ──────────────────────────────────────────────────
 *
 * Zag measures the panel and writes `--height`/`--width` onto it for a height
 * transition. The shared stylesheet defines no such transition for Accordion —
 * `.accordion__panel` is `overflow: hidden` and nothing else — so the
 * measurement would be a `ResizeObserver` per item feeding two custom properties
 * no rule reads. It is left out; `Collapsible`, when it is ported, is where that
 * measurement actually earns its keep.
 */
@Component({
  selector: "div[uioAccordion]",
  standalone: true,
  exportAs: "uioAccordion",
  imports: [NgTemplateOutlet, UioIcon],
  template: `
    @for (item of items(); track keyOf(item)) {
      <div
        class="accordion__item"
        data-scope="accordion"
        data-part="item"
        [id]="itemId(keyOf(item))"
        [attr.data-state]="stateOf(keyOf(item))"
        [attr.data-disabled]="flag(isDisabled(item))"
        [attr.data-focus]="flag(focusedValue() === keyOf(item))"
        [attr.data-orientation]="orientation()"
      >
        <!--
          Ark has no Header part, and a trigger that is not inside a heading is
          invisible to a screen reader's heading list — so the other three wrap
          it themselves and so does this. It carries no scope or part, because
          it is not one of Ark's.
        -->
        <h3 class="accordion__header">
          <button
            class="accordion__trigger"
            data-scope="accordion"
            data-part="item-trigger"
            type="button"
            [id]="triggerId(keyOf(item))"
            [attr.aria-controls]="contentId(keyOf(item))"
            [attr.data-controls]="contentId(keyOf(item))"
            [attr.aria-expanded]="isOpen(keyOf(item))"
            [attr.data-state]="stateOf(keyOf(item))"
            [attr.data-focus]="flag(focusedValue() === keyOf(item))"
            [attr.data-orientation]="orientation()"
            [attr.data-ownedby]="rootId"
            [disabled]="isDisabled(item)"
            (click)="toggle(item)"
            (focus)="onTriggerFocus(keyOf(item))"
            (blur)="onTriggerBlur()"
            (keydown)="onKeydown($event, keyOf(item))"
          >
            <span class="accordion__title">{{ item.title }}</span>
            <span uioIcon class="accordion__icon" name="chevron-down" [size]="ICON_SIZE"></span>
          </button>
        </h3>
        <div
          class="accordion__panel text-default-body-medium"
          data-scope="accordion"
          data-part="item-content"
          data-collapsible
          role="region"
          [id]="contentId(keyOf(item))"
          [attr.aria-labelledby]="triggerId(keyOf(item))"
          [attr.data-state]="isOpen(keyOf(item)) ? null : 'closed'"
          [attr.data-disabled]="flag(isDisabled(item))"
          [attr.data-focus]="flag(focusedValue() === keyOf(item))"
          [attr.data-orientation]="orientation()"
          [attr.hidden]="isOpen(keyOf(item)) ? null : ''"
        >
          <div class="accordion__content">
            @if (asTemplate(item.content); as template) {
              <ng-container [ngTemplateOutlet]="template" />
            } @else {
              {{ item.content }}
            }
          </div>
        </div>
      </div>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioAccordion extends UioPart {
  readonly scope = "accordion";
  readonly part = "root";

  readonly items = input<readonly AccordionItem[]>([]);
  /** The open items. Uncontrolled until something binds it — see `UioSwitch`. */
  readonly value = model<readonly (string | number)[] | undefined>(undefined);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly variant = input<AccordionVariant>("default");
  readonly size = input<AccordionSize>("md");
  /**
   * Not an override of the base's `disabled`, deliberately.
   *
   * `UioPart` binds `data-disabled` from that signal, and Ark's accordion **root**
   * reports no such attribute — only the items and their parts do. Overriding it
   * would put `data-disabled` on the root of every disabled accordion, which no
   * other library emits and which `.accordion--*` rules would then be free to
   * pick up. Same split, for the same reason, as `UioSwitch`'s `disabledInput`.
   */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  readonly valueChange = output<string[]>();

  /**
   * Fixed, not an input: the shared stylesheet lays an accordion out in one
   * direction only, and Ark's horizontal orientation would need rules none of
   * the four libraries ship. Declared anyway because every part reports it.
   */
  override readonly orientation: Signal<"vertical"> = signal("vertical");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly ICON_SIZE = ICON_SIZE;
  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() =>
    accordionStyles({ variant: this.variant(), size: this.size() }),
  );

  private readonly open = computed(
    () => new Set((this.value() ?? []).map((entry) => String(entry))),
  );

  /** Cleared on blur, unlike Tabs — Zag's accordion does not test `relatedTarget`. */
  private readonly focusedTab = signal<string | null>(null);
  readonly focusedValue: Signal<string | null> = this.focusedTab;

  /** Ark builds every id as `<scope>:<machine>:<part>` — see the class note. */
  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `accordion:${this.machine}`;
  }
  protected itemId(value: string): string {
    return `collapsible:accordion:${this.machine}:item:${value}`;
  }
  protected triggerId(value: string): string {
    return `accordion:${this.machine}:trigger:${value}`;
  }
  protected contentId(value: string): string {
    return `accordion:${this.machine}:content:${value}`;
  }

  protected keyOf(item: AccordionItem): string {
    return String(item.value);
  }
  protected isOpen(value: string): boolean {
    return this.open().has(value);
  }
  protected stateOf(value: string): "open" | "closed" {
    return this.isOpen(value) ? "open" : "closed";
  }
  /**
   * `??`, not `||`. Zag reads `props.disabled ?? prop("disabled")`, so an item
   * that says `disabled: false` stays enabled inside a disabled accordion — and
   * an item that says nothing inherits. `||` would collapse the two.
   */
  protected isDisabled(item: AccordionItem): boolean {
    return item.disabled ?? this.disabledInput();
  }
  protected asTemplate(content: AccordionItem["content"]): TemplateRef<unknown> | null {
    return content instanceof TemplateRef ? content : null;
  }

  protected toggle(item: AccordionItem): void {
    if (this.isDisabled(item)) return;
    const value = this.keyOf(item);
    const open = this.open();
    let next: string[];
    if (open.has(value)) {
      // Closing is always allowed. React passes `collapsible: !multiple` so that
      // single mode keeps the "click the open one to close it" behaviour Zag
      // implies for multiple mode; with both branches written out there is no
      // flag to get backwards.
      next = this.multiple() ? [...open].filter((entry) => entry !== value) : [];
    } else {
      next = this.multiple() ? [...open, value] : [value];
    }
    this.value.set(next);
    this.valueChange.emit(next);
    flushNow(this.appRef);
  }

  protected onTriggerFocus(value: string): void {
    this.focusedTab.set(value);
    flushNow(this.appRef);
  }
  protected onTriggerBlur(): void {
    this.focusedTab.set(null);
    flushNow(this.appRef);
  }

  /**
   * Arrow keys move focus between triggers, wrapping and skipping disabled ones.
   *
   * On the trigger rather than on the root, which is where Zag binds it: the
   * panel of an open item is inside the root too, and a root-level handler would
   * swallow an ArrowDown a user pressed inside the panel's own content.
   */
  protected onKeydown(event: KeyboardEvent, value: string): void {
    const move = ((): number | "home" | "end" | null => {
      switch (event.key) {
        case "ArrowDown":
          return 1;
        case "ArrowUp":
          return -1;
        case "Home":
          return "home";
        case "End":
          return "end";
        default:
          return null;
      }
    })();
    if (move === null) return;
    event.preventDefault();

    const items = this.items();
    const navigable = items.map((item) => ({ disabled: this.isDisabled(item) }));
    // -1 is `moveHighlight`'s "nothing highlighted yet": Home and End start from
    // the far end and walk to the first enabled trigger.
    const from = move === "home" || move === "end" ? -1 : this.indexOf(value);
    const step = move === "home" ? 1 : move === "end" ? -1 : move;
    const next = moveHighlight(navigable, from, step);
    if (next === -1) return;
    // Focus only. Zag's accordion has no automatic activation — arrowing moves
    // between headers and Enter opens the one you land on, which is the APG's
    // rule and the opposite of Tabs.
    this.triggerElements()[next]?.focus();
  }

  private indexOf(value: string): number {
    return this.items().findIndex((item) => this.keyOf(item) === value);
  }

  /** Index-aligned with `items()`, because one `@for` renders both. */
  private triggerElements(): HTMLElement[] {
    return [
      ...this.host.nativeElement.querySelectorAll<HTMLElement>('[data-part="item-trigger"]'),
    ];
  }
}
