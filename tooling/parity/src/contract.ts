/**
 * Extracting the DOM contract from rendered markup.
 *
 * There is exactly one stylesheet and every framework library shares it, so
 * "renders the same classes and the same state attributes" is not a nice
 * property — it is the whole basis on which a Svelte component is styled at all.
 * A Svelte Button that emits `btn--medium` instead of `btn--md` type-checks,
 * renders, and is invisibly unstyled. Nothing else in the build catches that.
 *
 * The libraries are resolved through their published export conditions, so what
 * is under test is what ships. That has one nasty failure mode — edit a
 * component, run this suite, and it passes against the *previous* build; the
 * first time that happened here a deliberately drifted class name came back
 * green. Hence the `pretest` script, which rebuilds all three packages before
 * vitest starts, whatever way the suite was invoked.
 *
 * The comparison is on parsed markup rather than raw HTML strings, because the
 * renderers legitimately disagree about attribute order, boolean spelling
 * (`disabled` vs `disabled=""`), whitespace, and Svelte's SSR comment markers.
 * None of that reaches the user; the class list and the ARIA do.
 */

import { JSDOM } from "jsdom";

export interface ElementContract {
  tag: string;
  classes: string[];
  /** `aria-*`, `role`, and the `data-*` attributes the stylesheets select on. */
  attributes: Record<string, string>;
}

/**
 * Replace generated ids with stable positional placeholders.
 *
 * Ark asks the framework for unique ids, and the frameworks answer differently —
 * React 18 produces `switch:r0:input`, Svelte 5 produces `switch:s1:input`. The
 * literal values are not the contract and never could be. What *is* the contract
 * is the relationship: that this input's `aria-labelledby` points at that label
 * and not at something else, or at nothing.
 *
 * So every id in the document is numbered in document order, and every reference
 * to one is rewritten to its number. A dangling reference — the failure
 * `OMIT_ARIA` exists to prevent — survives this untouched, because it points at
 * an id that was never issued and so has no placeholder.
 */
function normalizeIds(root: Element): Map<string, string> {
  const ids = new Map<string, string>();
  let next = 0;
  for (const el of root.querySelectorAll("[id]")) {
    const id = el.getAttribute("id")!;
    if (!ids.has(id)) ids.set(id, `#${next++}`);
  }
  return ids;
}

function applyIdMap(value: string, ids: Map<string, string>): string {
  // Longest first, so one id that is a prefix of another cannot shadow it.
  const keys = [...ids.keys()].sort((a, b) => b.length - a.length);
  let out = value;
  for (const id of keys) out = out.split(id).join(ids.get(id)!);
  return out;
}

/** Attributes that carry meaning for styling or assistive tech. */
function isContractAttribute(name: string): boolean {
  return (
    name === "id" ||
    name === "role" ||
    name === "type" ||
    name === "disabled" ||
    name === "hidden" ||
    name.startsWith("aria-") ||
    name.startsWith("data-")
  );
}

/**
 * Svelte's SSR output carries `<!--[-->` / `<!--]-->` markers and React 18 emits
 * `<!--$-->` comments; both are renderer bookkeeping, not content.
 */
function stripComments(root: Element): void {
  const walker = root.ownerDocument.createTreeWalker(root, 128 /* SHOW_COMMENT */);
  const found: Comment[] = [];
  let node = walker.nextNode();
  while (node) {
    found.push(node as Comment);
    node = walker.nextNode();
  }
  for (const comment of found) comment.remove();
}

export function contractOf(html: string): ElementContract[] {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const root = dom.window.document.getElementById("root")!;
  stripComments(root);

  const ids = normalizeIds(root);
  const out: ElementContract[] = [];
  for (const el of root.querySelectorAll("*")) {
    const attributes: Record<string, string> = {};
    for (const attr of el.attributes) {
      if (isContractAttribute(attr.name)) attributes[attr.name] = applyIdMap(attr.value, ids);
    }
    out.push({
      tag: el.tagName.toLowerCase(),
      classes: [...el.classList].sort(),
      attributes,
    });
  }
  return out;
}

/**
 * The visible text, so a dropped label or a missing icon is caught too.
 *
 * Whitespace-only text nodes are removed first. JSX strips the newlines between
 * sibling elements and Svelte keeps them, so `<CardHeader>` / `<CardBody>` /
 * `<CardFooter>` written the same way in both produce "HeaderBodyFooter" in one
 * and "Header Body Footer" in the other. That difference is markup formatting,
 * not content, and the browser collapses it to nothing visible between two block
 * elements anyway.
 *
 * The cost is that a deliberate single space *between two inline elements* would
 * not be compared. Nothing in the library relies on one — spacing between parts
 * is `gap` in the stylesheet, which is exactly the kind of thing the class
 * comparison covers.
 */
export function textOf(html: string): string {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const root = dom.window.document.getElementById("root")!;
  stripComments(root);

  const walker = root.ownerDocument.createTreeWalker(root, 4 /* SHOW_TEXT */);
  const blank: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (!(node.textContent ?? "").trim()) blank.push(node as Text);
    node = walker.nextNode();
  }
  for (const text of blank) text.remove();

  return (root.textContent ?? "").replace(/\s+/g, " ").trim();
}
