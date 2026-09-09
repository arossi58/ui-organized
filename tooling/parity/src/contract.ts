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
  /**
   * This element's own text — its direct child text nodes only, collapsed and
   * trimmed. Not the subtree's, which would fold every descendant's text into
   * every ancestor and turn one difference into a cascade of failures.
   *
   * Per-element is also the only granularity that survives the two renderers'
   * whitespace habits. JSX strips the newlines around `{label}`; Svelte keeps
   * them, so the same label is `"Email"` in one and `"\n  Email\n"` in the
   * other. Neither difference is visible — a browser collapses both — and
   * trimming each node makes them comparable without hiding a real change to
   * the text itself.
   */
  text: string;
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

  /**
   * Zag also stamps its *machine* id onto attributes like `data-ownedby`, and
   * that id belongs to no element — the root of a portalled component may not
   * render one at all. Mapping element ids alone therefore leaves those
   * references looking different when they are not: React's `:R0:` and Svelte's
   * `s1` name the same machine.
   *
   * Every Ark element carries `data-scope` and `data-part`, and its id is
   * `<scope>:<machine>:<part>`, so the machine id can be recovered by stripping
   * the two ends off. Collect those and map them too.
   */
  let nextMachine = 0;
  for (const el of root.querySelectorAll("[id][data-scope][data-part]")) {
    const id = el.getAttribute("id")!;
    const scope = el.getAttribute("data-scope")!;
    const part = el.getAttribute("data-part")!;
    if (!id.startsWith(`${scope}:`) || !id.endsWith(`:${part}`)) continue;
    const machine = id.slice(scope.length + 1, id.length - part.length - 1);
    if (machine && !ids.has(machine)) ids.set(machine, `@${nextMachine++}`);
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

/**
 * @param select   Optional CSS selector limiting the comparison to one subtree.
 * @param blankText Optional selectors whose elements' text is not compared. See
 *   `allowTextIn` in cases.ts — every one is checked to be aria-hidden.
 * @param exclude  Optional CSS selector whose matches (and their subtrees) are
 *   dropped. Both exist for portalled components — see `select` in cases.ts.
 *   `exclude` is the one to reach for when the portal sits *inside* the subtree
 *   worth comparing, as it does for Select, where the popup is a descendant of
 *   the field that holds the label, helper text and hidden native control.
 */
/**
 * One document, reused for every parse.
 *
 * `contractOf` and `hiddenFromAssistiveTech` used to build a `new JSDOM` per
 * call, and `contractOf` runs twice per case — once for React, once for the
 * library under comparison. At a few hundred cases that is invisible; past
 * ~1650 the suite died with `FATAL ERROR: JavaScript heap out of memory`, and
 * raising the worker heap to 4 GB did not save it, because the cost is thousands
 * of live `Window` objects rather than anything the cases retain.
 *
 * Reuse is safe here and not a shortcut: every call replaces `innerHTML`
 * outright, both functions are synchronous, and the value that escapes is plain
 * data — tag names, class lists and attribute strings — so no node outlives the
 * call that made it. Vitest runs a file's tests one at a time and neither
 * function awaits, so two parses can never interleave.
 *
 * If either function ever becomes async, or the suite starts running cases
 * concurrently, this has to go back to a document per call.
 */
const scratch = new JSDOM("<div id=\"root\"></div>");

function parseIntoRoot(html: string): HTMLElement {
  const root = scratch.window.document.getElementById("root") as HTMLElement;
  root.innerHTML = html;
  return root;
}

export function contractOf(
  html: string,
  select?: string,
  exclude?: string,
  blankText: string[] = [],
): ElementContract[] {
  let root = parseIntoRoot(html);
  stripComments(root);
  // Excluded content is dropped *before* the ids are numbered. The numbering is
  // positional, so counting elements that one library renders and the other does
  // not would shift every later placeholder and report identical markup as
  // different — which is exactly what happened with Select's hidden native
  // control, numbered #7 against #3 purely because React renders its portalled
  // popup inline and Svelte does not.
  if (exclude) for (const el of [...root.querySelectorAll(exclude)]) el.remove();
  // Still built before *scoping*, though: a selected subtree can legitimately
  // reference ids outside itself.
  const ids = normalizeIds(root);
  if (select) {
    const scoped = root.querySelector(select);
    if (!scoped) return [];
    root = scoped as HTMLElement;
  }

  const out: ElementContract[] = [];
  for (const el of [root, ...root.querySelectorAll("*")]) {
    if (el.id === "root") continue;
    const attributes: Record<string, string> = {};
    for (const attr of el.attributes) {
      if (isContractAttribute(attr.name)) attributes[attr.name] = applyIdMap(attr.value, ids);
    }
    const ownText = [...el.childNodes]
      .filter((n) => n.nodeType === 3 /* TEXT_NODE */)
      .map((n) => (n.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");

    out.push({
      tag: el.tagName.toLowerCase(),
      classes: [...el.classList].sort(),
      attributes,
      text: blankText.some((sel) => el.matches(sel)) ? "" : ownText,
    });
  }
  return out;
}


/**
 * Elements matching `selector` that are NOT hidden from assistive technology.
 *
 * Backs the text-allowance check: a text difference is only invisible if nothing
 * can read it, so an allowance is valid exactly when this returns nothing.
 */
export function hiddenFromAssistiveTech(html: string, selector: string): string[] {
  const root = parseIntoRoot(html);
  const readable: string[] = [];
  for (const el of root.querySelectorAll(selector)) {
    if (!el.closest('[aria-hidden="true"]')) readable.push(el.outerHTML.slice(0, 120));
  }
  return readable;
}
