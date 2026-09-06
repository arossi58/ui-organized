import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
  type Signal,
} from "@angular/core";
import type { ElementProps, TableStyle } from "@ui-organized/table-core";

/**
 * Core's prop bags, applied to a real element.
 *
 * ── Why this directive exists ───────────────────────────────────────────────
 *
 * `@ui-organized/table-core` decides every class name, ARIA attribute and sticky
 * offset in one framework-free place and hands each back as a plain object — and
 * the other three adapters just spread it: `{...getCellProps(cell)}`. Angular
 * templates have no spread. Without this, eleven prop builders would have to be
 * unpacked field by field at thirty-odd call sites, and every field a builder
 * gained later would be silently missing from whichever sites nobody updated.
 *
 * So the spread becomes a directive, and the call site stays one binding:
 *
 * ```html
 * <td [uioTableProps]="cellProps()">…</td>
 * ```
 *
 * ── Why it diffs rather than assigns ────────────────────────────────────────
 *
 * These bags change shape, not just value: a cell that stops being focused loses
 * `data-focus` entirely rather than setting it to `false`, and core is deliberate
 * about that — `stateFlag`'s whole point is that the stylesheet selects on
 * presence. So the previous keys are remembered and the ones that went away are
 * removed. Assigning only what is present would leave a stale `data-focus` on
 * every cell the cursor ever visited.
 *
 * ── Numeric lengths get `px` ────────────────────────────────────────────────
 *
 * React appends the unit for us and nothing else does. A column width of `180`
 * reaching the DOM as `width:180` is not a length, so the column falls back to
 * auto and the whole `table-layout: fixed` contract comes apart — invisible to
 * the parity gate, which does not compare `style`, and obvious the moment anyone
 * looks at the table. `@ui-organized/vue-table` found this the hard way.
 */

/** The one property in core's `TableStyle` whose numbers are not lengths. */
const UNITLESS = new Set<keyof TableStyle>(["zIndex"]);

const CAMEL = /[A-Z]/g;
const kebab = (key: string) => key.replace(CAMEL, (letter) => `-${letter.toLowerCase()}`);

function styleValue(key: string, value: string | number): string {
  return typeof value === "number" && !UNITLESS.has(key as keyof TableStyle)
    ? `${value}px`
    : String(value);
}

/**
 * The keys that are *properties* on the element rather than attributes.
 *
 * `tabIndex` and `colSpan` reach the DOM under different names than they are
 * written in, and `hidden` is a boolean attribute whose presence is the value.
 */
function attributeName(key: string): string {
  if (key === "tabIndex") return "tabindex";
  if (key === "colSpan") return "colspan";
  return key;
}

interface Applied {
  attributes: Set<string>;
  styles: Set<string>;
}

export function applyElementProps(
  element: HTMLElement,
  renderer: Renderer2,
  props: ElementProps,
  previous: Applied,
): Applied {
  const attributes = new Set<string>();
  const styles = new Set<string>();

  for (const [key, raw] of Object.entries(props)) {
    if (raw === undefined) continue;
    // `false` is a real value for an ARIA attribute and the absence of one for
    // every other kind. See the `aria-` branch below.
    if (raw === false && !key.startsWith("aria-")) continue;
    if (key === "className") {
      renderer.setAttribute(element, "class", String(raw));
      attributes.add("class");
      continue;
    }
    if (key === "style") {
      for (const [property, value] of Object.entries(raw as TableStyle)) {
        if (value === undefined) continue;
        renderer.setStyle(element, kebab(property), styleValue(property, value));
        styles.add(kebab(property));
      }
      continue;
    }
    const name = attributeName(key);
    /**
     * ARIA booleans are *enumerated*, not presence.
     *
     * `aria-selected="true"` and `aria-selected="false"` are two different
     * answers, and `aria-selected=""` is neither — it is invalid, and a screen
     * reader falls back to "not selected" for a row that is. So an `aria-`
     * attribute is always stringified, `false` included, which is also exactly
     * what React does with one.
     *
     * Every other boolean attribute is the opposite: presence *is* the value, so
     * `true` writes an empty string and `false` was dropped above. That is what
     * core's own `stateFlag` produces for the other three libraries.
     */
    const value = key.startsWith("aria-") ? String(raw) : raw === true ? "" : String(raw);
    renderer.setAttribute(element, name, value);
    attributes.add(name);
  }

  for (const name of previous.attributes) {
    if (!attributes.has(name)) renderer.removeAttribute(element, name);
  }
  for (const property of previous.styles) {
    if (!styles.has(property)) renderer.removeStyle(element, property);
  }

  return { attributes, styles };
}

@Directive({
  selector: "[uioTableProps]",
  standalone: true,
})
export class UioTableProps {
  readonly props: Signal<ElementProps> = input.required<ElementProps>({ alias: "uioTableProps" });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private applied: Applied = { attributes: new Set(), styles: new Set() };

  constructor() {
    effect(() => {
      this.applied = applyElementProps(
        this.host.nativeElement,
        this.renderer,
        this.props(),
        this.applied,
      );
    });
  }
}
