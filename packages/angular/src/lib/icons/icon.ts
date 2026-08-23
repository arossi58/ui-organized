import { Directive, ElementRef, computed, effect, inject, input, type OnInit } from "@angular/core";
import {
  resolveIconComponent,
  resolveIconStroke,
  resolveIconSvgProps,
} from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { injectIconConfig } from "./icon-config.js";
import { getIconSet, registeredLibraries, type IconMarkup, type IconSet } from "./registry.js";
import { warnMissingIconSet } from "./warn-missing-icon-set.js";

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
 * wrote, so it takes the element out instead. An empty `<span class="icon">`
 * would not be invisible: `.icon` is `display: inline-flex` with its own
 * layout, and it would hold space in a flex row that has no icon in the other
 * three libraries.
 *
 * That decision is made once, at init, because it is a misconfiguration rather
 * than a state — registering an icon set after the first render is not a case
 * this supports, in any of the four libraries.
 */
@Directive({
  selector: "span[uioIcon]",
  standalone: true,
  host: {
    class: "icon",
    "[attr.aria-label]": "label() ?? null",
    "[attr.aria-hidden]": "label() ? null : true",
    "[attr.role]": "label() ? 'img' : null",
  },
})
export class UioIcon implements OnInit {
  /** A canonical name from the design system's set. */
  readonly name = input<CanonicalIconName | undefined>(undefined);
  /**
   * SVG markup supplied directly, which needs no registered set and no
   * canonical name.
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

  private readonly set = computed<IconSet | undefined>(() => {
    if (this.svg()) return undefined;
    return this.config().icons ?? getIconSet(this.config().library);
  });

  private readonly markup = computed<IconMarkup | undefined>(
    () =>
      this.svg() ??
      resolveIconComponent(this.set(), this.name() as CanonicalIconName, this.config().style),
  );

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

  private removed = false;
  private drawn?: { markup: string; element: SVGElement };
  private applied: ReadonlySet<string> = new Set();

  constructor() {
    effect(() => {
      const markup = this.markup();
      const props = this.svgProps();
      if (this.removed || !markup) return;
      this.draw(markup, props);
    });
  }

  ngOnInit(): void {
    if (this.markup()) return;
    if (!this.svg() && !this.set()) {
      warnMissingIconSet(this.config().library, registeredLibraries());
    }
    this.host.nativeElement.remove();
    this.removed = true;
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
