/**
 * Normalizer verification (COMPONENT-PLUGIN.md §3, Phase 3 exit criteria).
 *
 * Runs the pure normalizer over hand-authored DOM captures that mirror what the
 * Playwright renderer extracts — for two structurally different components
 * (Button: a horizontal box with an inline label; Card: a vertical box with a
 * stroke and multiple text children) plus a grid case to prove graceful
 * degradation. No browser required. Asserts the produced ComponentSpec is what
 * the Phase 0 Builder consumes.
 *
 * Run: pnpm --filter @ui-organized/figma-component-bridge check:normalizer
 */

import assert from "node:assert/strict";
import { normalizeCapture } from "../src/normalize";
import type { CaptureNode, ComponentCapture } from "../src/capture";
import type { FrameNodeSpec, TextNodeSpec } from "../src/spec";

const isFrame = (n: unknown): n is FrameNodeSpec => (n as FrameNodeSpec)?.type === "FRAME";
const isText = (n: unknown): n is TextNodeSpec => (n as TextNodeSpec)?.type === "TEXT";

// ─── Button: <button class="btn btn--primary btn--md">Button</button> ──────────

const buttonRoot: CaptureNode = {
  tag: "button",
  className: "btn btn--primary btn--md",
  rect: { x: 0, y: 0, width: 96, height: 40 },
  styles: {
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "4px",
    gap: "4px",
    paddingTop: "8px",
    paddingRight: "16px",
    paddingBottom: "8px",
    paddingLeft: "16px",
    backgroundColor: "rgb(37, 99, 235)",
    color: "rgb(255, 255, 255)",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "rgba(0, 0, 0, 0)", // transparent border on .btn — should be ignored
    borderTopLeftRadius: "8px",
    fontSize: "14px",
    position: "static",
  },
  varRefs: {
    backgroundColor: "--color-interactive-primary-default",
    borderTopLeftRadius: "--radius-interactive",
    color: "--color-interactive-contents",
  },
  tokens: {
    "--color-interactive-primary-default": "rgb(37, 99, 235)",
    "--radius-interactive": "8px",
    "--color-interactive-contents": "rgb(255, 255, 255)",
  },
  text: "Button",
  children: [],
};

const buttonCapture: ComponentCapture = {
  component: "Button",
  storyId: "components-actions-button--default",
  variants: [{ props: { intent: "primary", size: "md", state: "default" }, root: buttonRoot }],
};

const button = normalizeCapture(buttonCapture);
const bTree = button.variants[0]!.tree;

assert.equal(bTree.type, "FRAME", "button root is a frame");
assert.equal(bTree.layout?.mode, "HORIZONTAL", "button is auto-layout HORIZONTAL");
assert.deepEqual(bTree.layout?.padding, [8, 16, 8, 16], "button padding");
assert.equal(bTree.layout?.gap, 4, "button gap from columnGap");
assert.equal(bTree.layout?.align, "CENTER");
assert.equal(bTree.box?.fill, "{--color-interactive-primary-default}", "fill is a token ref");
assert.equal(bTree.box?.radius, "{--radius-interactive}", "radius is a token ref");
assert.equal(bTree.box?.stroke, undefined, "transparent border ignored");
const bLabel = bTree.children?.[0];
assert.ok(isText(bLabel) && bLabel.text === "Button", "label text node");
assert.equal(bLabel.typography?.color, "{--color-interactive-contents}", "label colour ref");
assert.equal(bLabel.typography?.size, 14, "label size (no token → raw px)");
assert.equal(button.unresolved.length, 0, "button: nothing unresolved");
assert.equal(button.fallbacks?.["--color-interactive-primary-default"], "rgb(37, 99, 235)", "fallback recorded");

// ─── Card: outlined, vertical, stroke + nested text children ────────────────────

const card = (className: string, text: string, colorVar: string, colorVal: string, size: string): CaptureNode => ({
  tag: "div",
  className,
  rect: { x: 0, y: 0, width: 280, height: 24 },
  styles: { display: "block", color: colorVal, fontSize: size },
  varRefs: { color: colorVar },
  tokens: { [colorVar]: colorVal },
  text,
  children: [],
});

const cardRoot: CaptureNode = {
  tag: "div",
  className: "card card--outlined",
  rect: { x: 0, y: 0, width: 320, height: 120 },
  styles: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "16px",
    paddingRight: "16px",
    paddingBottom: "16px",
    paddingLeft: "16px",
    backgroundColor: "rgb(25, 25, 25)",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "rgb(80, 80, 80)",
    borderTopLeftRadius: "8px",
    position: "static",
  },
  varRefs: {
    backgroundColor: "--color-surface-medium",
    borderTopColor: "--color-border-medium",
    borderTopLeftRadius: "--border-radius-04",
  },
  tokens: {
    "--color-surface-medium": "rgb(25, 25, 25)",
    "--color-border-medium": "rgb(80, 80, 80)",
    "--border-radius-04": "8px",
  },
  children: [
    card("card__title", "Title", "--color-content-primary", "rgb(255, 255, 255)", "16px"),
    card("card__body", "Body content", "--color-content-secondary", "rgb(200, 200, 200)", "14px"),
  ],
};

const cardCapture: ComponentCapture = {
  component: "Card",
  storyId: "components-containers-card--outlined",
  variants: [{ props: { variant: "outlined", state: "default" }, root: cardRoot }],
};

const cardSpec = normalizeCapture(cardCapture);
const cTree = cardSpec.variants[0]!.tree;

assert.equal(cTree.layout?.mode, "VERTICAL", "card is auto-layout VERTICAL");
assert.equal(cTree.layout?.gap, 8, "card gap from rowGap/gap");
assert.deepEqual(cTree.layout?.padding, [16, 16, 16, 16], "card padding");
assert.equal(cTree.box?.fill, "{--color-surface-medium}", "card fill ref");
assert.equal(cTree.box?.stroke, "{--color-border-medium}", "card stroke ref");
assert.equal(cTree.box?.strokeWidth, 1, "card stroke width");
assert.equal(cTree.box?.radius, "{--border-radius-04}", "card radius ref");
assert.equal(cTree.children?.length, 2, "card has two children");
assert.ok(isText(cTree.children?.[0]) && (cTree.children![0] as TextNodeSpec).text === "Title");
assert.equal((cTree.children![1] as TextNodeSpec).typography?.color, "{--color-content-secondary}");
assert.equal(cardSpec.unresolved.length, 0, "card: nothing unresolved");

// ─── Icon + disabled: <button><svg/> #text "Button" </button> at opacity 0.4 ────

const iconButton: ComponentCapture = {
  component: "Button",
  storyId: "components-actions-button--default",
  variants: [
    {
      props: { intent: "primary", icon: "left", state: "disabled" },
      root: {
        tag: "button",
        className: "btn btn--primary btn--md",
        rect: { x: 0, y: 0, width: 120, height: 40 },
        styles: {
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: "4px",
          paddingTop: "8px",
          paddingRight: "16px",
          paddingBottom: "8px",
          paddingLeft: "16px",
          backgroundColor: "rgb(37, 99, 235)",
          borderTopLeftRadius: "8px",
          opacity: "0.4",
        },
        varRefs: { backgroundColor: "--color-interactive-primary-default", borderTopLeftRadius: "--radius-interactive" },
        tokens: { "--color-interactive-primary-default": "rgb(37, 99, 235)", "--radius-interactive": "8px" },
        children: [
          {
            // The Icon component wraps the svg in <span class="icon"> — the
            // normalizer should collapse the wrapper down to the icon itself.
            tag: "span",
            className: "icon",
            rect: { x: 0, y: 0, width: 16, height: 16 },
            styles: { display: "inline-flex" },
            children: [
              {
                tag: "svg",
                rect: { x: 0, y: 0, width: 16, height: 16 },
                styles: {},
                svg: '<svg class="lucide lucide-plus" width="16" height="16" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14"/></svg>',
                iconName: "plus",
                children: [],
              },
            ],
          },
          {
            tag: "#text",
            rect: { x: 0, y: 0, width: 44, height: 20 },
            styles: { color: "rgb(255, 255, 255)", fontSize: "14px" },
            varRefs: { color: "--color-interactive-contents" },
            tokens: {},
            text: "Button",
            children: [],
          },
        ],
      },
    },
  ],
};

const iconSpec = normalizeCapture(iconButton);
const iTree = iconSpec.variants[0]!.tree;

assert.equal(iTree.opacity, 0.4, "disabled state carries through as opacity");
assert.equal(iTree.children?.length, 2, "icon button has icon + label");
const icon = iTree.children?.[0];
assert.ok(icon && (icon as { type?: string }).type === "VECTOR", "first child is a VECTOR icon");
assert.ok((icon as { svg?: string }).svg?.startsWith("<svg"), "icon keeps its SVG markup");
assert.equal((icon as { iconName?: string }).iconName, "plus", "icon name carried through for component matching");

// ─── Forced state: rendered colour wins over a stale authored var-ref ───────────

const hoverButton: ComponentCapture = {
  component: "Button",
  storyId: "x--hover",
  variants: [
    {
      props: { intent: "primary", state: "hover" },
      root: {
        tag: "button",
        rect: { x: 0, y: 0, width: 96, height: 40 },
        styles: { display: "inline-flex", flexDirection: "row", backgroundColor: "rgb(30, 64, 175)" },
        // CDP matched-rules report the BASE rule under forced :hover — stale.
        varRefs: { backgroundColor: "--color-interactive-primary-default" },
        tokens: {
          "--color-interactive-primary-default": "rgb(37, 99, 235)",
          "--color-interactive-primary-hover": "rgb(30, 64, 175)", // == rendered colour
        },
        children: [],
      },
    },
  ],
};

const hoverSpec = normalizeCapture(hoverButton);
assert.equal(
  hoverSpec.variants[0]!.tree.box?.fill,
  "{--color-interactive-primary-hover}",
  "forced hover captures the hover token despite the stale authored var-ref",
);
const label = iTree.children?.[1];
assert.ok(isText(label) && label.text === "Button", "second child is the label (DOM order: icon then label)");
assert.equal((label as TextNodeSpec).typography?.color, "{--color-interactive-contents}", "label colour from #text varRef");

// ─── Graceful degradation: a CSS grid container → LAYOUT_UNMAPPABLE ─────────────

const gridCapture: ComponentCapture = {
  component: "Grid",
  storyId: "x--grid",
  variants: [
    {
      props: { state: "default" },
      root: {
        tag: "div",
        rect: { x: 0, y: 0, width: 100, height: 100 },
        styles: { display: "grid", backgroundColor: "rgba(0,0,0,0)" },
        children: [{ tag: "span", rect: { x: 0, y: 0, width: 10, height: 10 }, styles: {}, text: "x", children: [] }],
      },
    },
  ],
};

const grid = normalizeCapture(gridCapture);
assert.ok(
  grid.unresolved.some((u) => u.kind === "LAYOUT_UNMAPPABLE"),
  "grid display flagged LAYOUT_UNMAPPABLE",
);

console.log("✓ Button capture → spec (HORIZONTAL box + token-bound label)");
console.log("✓ Card capture → spec (VERTICAL box + stroke + 2 text children)");
console.log("✓ icon button → wrapper collapsed to VECTOR + label in DOM order, disabled opacity 0.4");
console.log("✓ forced hover → hover token (rendered colour wins over stale var-ref)");
console.log("✓ grid → LAYOUT_UNMAPPABLE (graceful degradation)");
console.log(`\nAll normalizer assertions passed. Button spec:\n`);
console.log(JSON.stringify(button.variants[0]!.tree, null, 2));
