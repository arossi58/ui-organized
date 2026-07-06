/**
 * The Renderer (COMPONENT-PLUGIN.md §3, Phase 3).
 *
 * Drives a real browser (Playwright/Chromium) against a running Storybook,
 * renders each variant of a component, and extracts a {@link ComponentCapture}:
 * the DOM tree + curated computed styles + the **authored** `var(--…)` behind
 * each token-bearing property (via CDP matched styles) + every token custom
 * property's resolved value (for fallback / reverse-match). Pseudo-states are
 * forced via CDP so `:hover` / `:active` / `:focus-visible` are capturable.
 *
 * Browser-gated: requires `playwright` + a browser (`npx playwright install
 * chromium`) and a Storybook to point at (dev server or `storybook build` +
 * static serve). The normalizer (src/normalize.ts) is the pure half and is
 * tested without any of this.
 */

import { chromium, type CDPSession, type Page } from "playwright";
import {
  CAPTURED_STYLES,
  CAPTURED_TEXT_STYLES,
  VAR_BEARING_PROPERTIES,
  type CaptureNode,
  type ComponentCapture,
  type VariantCapture,
} from "../src/capture";

/** Internal capture node, before varRefs enrichment (carries a CDP map key). */
interface RawNode extends CaptureNode {
  capId: string;
  children: RawNode[];
}

export interface RenderVariant {
  /** Display props → the Figma variant axes (includes the pseudo-axis `state`). */
  props: Record<string, string>;
  /** Storybook args for this render (may differ, e.g. icon=plus + iconPosition=left). */
  args: Record<string, string>;
}

export interface RenderOptions {
  /** Base URL of a running Storybook, e.g. http://localhost:6006. */
  storybookUrl: string;
  component: string;
  /** Variant combinations to render. */
  variants: RenderVariant[];
  /** Token custom-property names to read resolved values for (reverse-match). */
  tokenVars: string[];
  /** Selector for the rendered component root within the story iframe. */
  rootSelector?: string;
}

/** CSS longhand/shorthand → the camelCase property our capture keys on. */
const CSS_TO_CAPTURE: Record<string, string> = {
  "background-color": "backgroundColor",
  color: "color",
  "border-top-color": "borderTopColor",
  "border-color": "borderTopColor",
  "border-top-left-radius": "borderTopLeftRadius",
  "border-radius": "borderTopLeftRadius",
  "font-size": "fontSize",
};

export async function renderComponent(opts: RenderOptions): Promise<ComponentCapture> {
  const rootSelector = opts.rootSelector ?? "#storybook-root > *";
  const storyId = await resolveStoryId(opts.storybookUrl, opts.component);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // tsx/esbuild wrap named functions with a `__name(fn, "name")` helper for
    // stack traces; that helper isn't defined in the page when Playwright
    // serialises captureInPage. Shim it as identity so the evaluate succeeds.
    await page.addInitScript(() => {
      const w = window as unknown as { __name?: (fn: unknown, name?: string) => unknown };
      if (!w.__name) w.__name = (fn) => fn;
    });
    const variants: VariantCapture[] = [];

    for (const { props, args } of opts.variants) {
      const url = `${opts.storybookUrl}/iframe.html?id=${storyId}&viewMode=story&args=${encodeArgs(args)}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(rootSelector, { timeout: 5000 });

      const cdp = await page.context().newCDPSession(page);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");

      await forceState(page, cdp, rootSelector, props.state);

      const root = (await page.evaluate(captureInPage, {
        rootSelector,
        styleProps: CAPTURED_STYLES as unknown as string[],
        textStyleProps: CAPTURED_TEXT_STYLES as unknown as string[],
        tokenVars: opts.tokenVars,
      })) as RawNode | null;

      if (root) {
        await enrichVarRefs(cdp, root);
        stripCapIds(root);
        variants.push({ props, root });
      }
      await cdp.detach();
    }

    return { component: opts.component, storyId, variants };
  } finally {
    await browser.close();
  }
}

// ─── Story resolution ───────────────────────────────────────────────────────

interface StoryIndex {
  entries: Record<string, { id: string; title: string; name: string; importPath: string; type: string }>;
}

async function resolveStoryId(storybookUrl: string, component: string): Promise<string> {
  const res = await fetch(`${storybookUrl}/index.json`);
  if (!res.ok) throw new Error(`Storybook index.json ${res.status} — is Storybook running at ${storybookUrl}?`);
  const index = (await res.json()) as StoryIndex;
  const stories = Object.values(index.entries).filter((e) => e.type === "story");
  const forComponent = stories.filter(
    (e) => e.importPath.includes(`/${component}.stories`) || e.title.endsWith(`/${component}`),
  );
  if (forComponent.length === 0) throw new Error(`No story found for "${component}".`);
  return (forComponent.find((e) => e.name === "Default") ?? forComponent[0]!).id;
}

/** Storybook args URL segment: `key:value;key2:value2` (state is not a story arg). */
function encodeArgs(props: Record<string, string>): string {
  return Object.entries(props)
    .filter(([k]) => k !== "state")
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

// ─── In-page capture (serialised into the page) ────────────────────────────────

function captureInPage(args: {
  rootSelector: string;
  styleProps: string[];
  textStyleProps: string[];
  tokenVars: string[];
}) {
  let counter = 0;
  const rectOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };

  function walk(el: Element): unknown {
    const capId = String(counter++);
    el.setAttribute("data-cap-id", capId);
    const tag = el.tagName.toLowerCase();

    // An icon: keep the SVG markup + its name (lucide/tabler set it in the class),
    // don't recurse into its paths.
    if (tag === "svg") {
      const cls = el.getAttribute("class") || "";
      const m = /lucide-([a-z0-9-]+)/.exec(cls) || /icon-tabler-([a-z0-9-]+)/.exec(cls) || /\bicon-([a-z0-9-]+)/.exec(cls);
      const iconName = m ? m[1] : undefined;
      return { capId, tag, rect: rectOf(el), styles: {}, svg: el.outerHTML, iconName, children: [] };
    }

    const cs = getComputedStyle(el);
    const read = (props: string[]) => {
      const out: Record<string, string> = {};
      for (const p of props) out[p] = (cs as unknown as Record<string, string>)[p] ?? "";
      return out;
    };
    const styles = read(args.styleProps);
    const textStyles = read(args.textStyleProps);
    const tokens: Record<string, string> = {};
    for (const v of args.tokenVars) {
      const val = cs.getPropertyValue(v).trim();
      if (val) tokens[v] = val;
    }

    // Walk childNodes (not just elements) so text runs keep their DOM order
    // relative to icons. A text run inherits this element's text styles and
    // shares its capId, so CDP var-refs (colour / font-size) map through.
    const children: unknown[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        const t = (child.textContent || "").trim();
        if (t) children.push({ capId, tag: "#text", rect: rectOf(el), styles: textStyles, tokens, text: t, children: [] });
      } else if (child.nodeType === 1) {
        children.push(walk(child as Element));
      }
    });

    return {
      capId,
      tag,
      className: typeof el.className === "string" && el.className ? el.className : undefined,
      rect: rectOf(el),
      styles,
      tokens,
      children,
    };
  }

  const root = document.querySelector(args.rootSelector);
  return root ? walk(root) : null;
}

// ─── CDP: authored var() refs + pseudo-state forcing ───────────────────────────

async function enrichVarRefs(cdp: CDPSession, node: RawNode): Promise<void> {
  const { root } = (await cdp.send("DOM.getDocument", { depth: -1 })) as { root: { nodeId: number } };
  async function visit(n: RawNode): Promise<void> {
    const { nodeId } = (await cdp.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: `[data-cap-id="${n.capId}"]`,
    })) as { nodeId: number };
    if (nodeId) {
      const matched = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
      const refs = extractVarRefs(matched);
      if (Object.keys(refs).length) n.varRefs = refs;
    }
    for (const c of n.children) await visit(c);
  }
  await visit(node);
}

/** Pull `var(--x)` authored values for the token-bearing properties (last wins). */
function extractVarRefs(matched: unknown): Record<string, string> {
  const refs: Record<string, string> = {};
  const want = new Set<string>(VAR_BEARING_PROPERTIES);
  const rules = (matched as { matchedCSSRules?: { rule: { style: { cssProperties: { name: string; value: string }[] } } }[] })
    .matchedCSSRules ?? [];
  for (const { rule } of rules) {
    for (const decl of rule.style.cssProperties) {
      const prop = CSS_TO_CAPTURE[decl.name];
      if (!prop || !want.has(prop)) continue;
      const m = /var\(\s*(--[A-Za-z0-9-]+)/.exec(decl.value);
      if (m) refs[prop] = m[1]!;
    }
  }
  return refs;
}

async function forceState(
  page: Page,
  cdp: CDPSession,
  rootSelector: string,
  state: string | undefined,
): Promise<void> {
  if (!state || state === "default") return;
  if (state === "disabled") {
    await page.evaluate((sel) => document.querySelector(sel)?.setAttribute("disabled", ""), rootSelector);
    return;
  }
  const pseudo = state === "focus" ? "focus-visible" : state; // hover | active | focus-visible
  const { root } = (await cdp.send("DOM.getDocument", {})) as { root: { nodeId: number } };
  const { nodeId } = (await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: rootSelector })) as {
    nodeId: number;
  };
  if (nodeId) {
    await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [pseudo] });
  }
}

function stripCapIds(node: RawNode): void {
  delete (node as { capId?: string }).capId;
  node.children.forEach((c) => stripCapIds(c as RawNode));
}
