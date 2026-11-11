import { Directive, ElementRef, computed, effect, inject, input } from "@angular/core";
import { HostPresence } from "../host-presence.js";
import {
  resolveIconStroke,
  resolveIconSvgProps,
  resolveSystemGlyph,
} from "@ui-organized/core";
import { glyphOf, type IconGlyph } from "./glyph.js";
import { injectIconConfig } from "./icon-config.js";
import {
  getIcon,
  getIconSet,
  registeredLibraries,
  registeredNames,
  type IconMarkup,
  type IconSet,
} from "./registry.js";
import { warnMissingIcon, warnMissingIconSet } from "./warn-missing-icon-set.js";

/**
 * An icon's name as its library publishes it: `"x"` or `"chevron-down"` in
 * Lucide and Tabler, `"x-mark"` in Heroicons. Nothing is renamed, so a name
 * belongs to one library. Register the icon first with `registerIcons` from
 * that library's subpath.
 */
export type IconName = string;

/**
 * Parse SVG markup into a real element.
 *
 * A detached `<template>` rather than `[innerHTML]`, because Angular's HTML
 * sanitizer does not know SVG and strips it to nothing. No `DomSanitizer`
 * bypass is involved and none is needed: nothing here is bound, the markup is
 * parsed into a document fragment and the resulting node is appended. This is
 * the same technique `@ng-icons/core` uses for the same reason.
 */
export function parseIconMarkup(document: Document, markup: string): SVGElement | null {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  const element = template.content.firstElementChild;
  return element && element.tagName.toLowerCase() === "svg" ? (element as SVGElement) : null;
}

/**
 * Put an adapter's resolved props onto the rendered `<svg>`.
 *
 * Angular has no spread, so where the other three libraries write
 * `<IconComponent {...svgProps} />` this has to set them one at a time. Two
 * kinds: a `--`-prefixed key is a CSS custom property (which is how every
 * `@ng-icons` pack takes its stroke width), anything else is an attribute.
 *
 * `previous` is what makes this correct rather than merely working. Adapters
 * omit a prop entirely rather than passing `undefined` — a solid icon has no
 * stroke, so the key is simply absent — so iterating the new props can never
 * clear one that has gone away. Switching a provider from outline to solid
 * would otherwise leave the last outline's stroke behind.
 */
export function applySvgProps(
  svg: SVGElement,
  props: Record<string, unknown>,
  previous: ReadonlySet<string>,
): Set<string> {
  for (const key of previous) {
    if (key in props) continue;
    if (key.startsWith("--")) svg.style.removeProperty(key);
    else svg.removeAttribute(key);
  }

  const applied = new Set<string>();
  for (const [key, value] of Object.entries(props)) {
    // Never stringify a missing value: `stroke-width="undefined"` is invalid and
    // renders nothing, which is worse than the attribute being absent.
    if (value === undefined || value === null) continue;
    if (key.startsWith("--")) svg.style.setProperty(key, String(value));
    else svg.setAttribute(key, String(value));
    applied.add(key);
  }
  return applied;
}

/**
 * The single interface for rendering an icon.
 *
 * Everything decided before anything is drawn — which glyph, how thick the
 * stroke, which props the library wants those numbers under — is shared code in
 * `@ui-organized/core`, so an icon comes out the same weight here as it does in
 * React. What is Angular's own is only how the SVG gets into the DOM.
 *
 * ```html
 * <span uioIcon name="check" [size]="16"></span>
 * <span uioIcon name="trash" label="Delete"></span>
 * <span uioIcon [svg]="myMarkup"></span>
 * ```
 *
 * There is no `class` input, unlike the other three libraries: the caller owns
 * the element, so their own `class` is already on it and Angular merges the
 * static `icon` from the host binding with it.
 *
 * ── Why it removes its own host ─────────────────────────────────────────────
 *
 * `Icon` renders **nothing** when it cannot resolve a name — no set registered,
 * or a name the set does not have. In React that is a `return null` and no
 * element exists. A directive cannot decline to render the element the caller
 * wrote, so `HostPresence` takes the element out instead, reversibly: a name
 * bound to a signal can become resolvable later, and the span has to come back
 * where it was. An empty `<span class="icon">` is not a substitute — `.icon` is
 * `display: inline-flex` with its own layout, and it would hold space in a flex
 * row that has no icon in the other three libraries.
 */
@Directive({
  selector: "span[uioIcon]",
  standalone: true,
  providers: [HostPresence],
  host: {
    class: "icon",
    "[attr.aria-label]": "label() ?? null",
    "[attr.aria-hidden]": "label() ? null : true",
    "[attr.role]": "label() ? 'img' : null",
  },
})
export class UioIcon {
  /** The icon's native name in the active library, registered with `registerIcons`. */
  readonly name = input<IconName | IconGlyph | undefined>(undefined);
  /**
   * SVG markup supplied directly, which needs no registration and no
   * registered set.
   *
   * A separate input rather than an overload of `name`, which is how React
   * spells it (`typeof name !== "string"`). With markup *being* a string that
   * test is unavailable, and sniffing for a leading `<` would be guesswork.
   */
  readonly svg = input<IconMarkup | undefined>(undefined);
  readonly size = input(24);
  /**
   * An accessible label for a meaningful icon. Without one the icon is
   * decorative and hidden from assistive technology — the right default, since
   * most icons sit beside a label that already says the same thing.
   */
  readonly label = input<string | undefined>(undefined);

  private readonly config = injectIconConfig();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly presence = inject(HostPresence);

  private readonly set = computed<IconSet | undefined>(() => {
    if (this.svg()) return undefined;
    return this.config().icons ?? getIconSet(this.config().library);
  });

  private readonly markup = computed<IconMarkup | undefined>(() => {
    const svg = this.svg();
    if (svg) return svg;
    const set = this.set();
    const name = this.name();
    if (!set || name === undefined) return undefined;
    const glyph = glyphOf(name);
    if (glyph) return resolveSystemGlyph(set, glyph, this.config().style);
    return getIcon(set.library, name as string, this.config().style);
  });

  private readonly stroke = computed(() =>
    resolveIconStroke({
      style: this.config().style,
      strokeAdjustment: this.config().strokeAdjustment,
      size: this.size(),
      baseStroke: this.config().baseStroke,
      baseSize: this.config().baseSize,
    }),
  );

  private readonly svgProps = computed<Record<string, unknown>>(() => {
    const stroke = this.stroke();
    if (this.svg()) {
      // No adapter to ask. The caller's markup is arbitrary, so the numbers go
      // on as plain SVG attributes rather than through a custom property only
      // the @ng-icons packs are written to read.
      return {
        width: this.size(),
        height: this.size(),
        ...(stroke !== undefined ? { "stroke-width": stroke } : {}),
      };
    }
    return resolveIconSvgProps(this.set(), this.size(), stroke);
  });

  private drawn?: { markup: string; element: SVGElement };
  private applied: ReadonlySet<string> = new Set();

  constructor() {
    effect(() => {
      const markup = this.markup();
      const props = this.svgProps();
      this.presence.set(!!markup);
      if (!markup) {
        // Once per library, globally — see the warning's own note on why it
        // fires in production too.
        const set = this.set();
        const name = this.name();
        if (!this.svg() && !set) {
          warnMissingIconSet(this.config().library, registeredLibraries());
        } else if (set && typeof name === "string") {
          warnMissingIcon(set.library, name, registeredNames(set.library));
        }
        return;
      }
      this.draw(markup, props);
    });
  }

  private draw(markup: string, props: Record<string, unknown>): void {
    const host = this.host.nativeElement;
    if (this.drawn?.markup !== markup) {
      this.drawn?.element.remove();
      const element = parseIconMarkup(host.ownerDocument, markup);
      if (!element) return;
      host.appendChild(element);
      this.drawn = { markup, element };
      this.applied = new Set();
    }
    this.applied = applySvgProps(this.drawn.element, props, this.applied);
  }
}
