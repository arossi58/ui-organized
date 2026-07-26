import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement, isValidElement, type ReactElement } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { projectRender } from "./projectRender.js";

/**
 * `render`-prop triggers used to drop `children` on the floor — the reported
 * symptom was an icon-only button with no label and no warning. These cover the
 * helper's behaviour and, just as importantly, that every trigger in the library
 * actually routes through it.
 */

const childrenOf = (el: ReactElement) => (el.props as { children?: unknown }).children;

afterEach(() => vi.restoreAllMocks());

describe("projectRender", () => {
  it("projects children into a render element that has none", () => {
    const render = createElement("button", { className: "btn" });
    const out = projectRender(render, "Add item", "PopoverTrigger");
    expect(childrenOf(out)).toBe("Add item");
    // The rendered element's own props survive.
    expect((out.props as { className?: string }).className).toBe("btn");
  });

  it("returns the render element untouched when there are no children", () => {
    const render = createElement("button", { className: "btn" });
    expect(projectRender(render, undefined, "PopoverTrigger")).toBe(render);
    expect(projectRender(render, null, "PopoverTrigger")).toBe(render);
    // `false` is what a `{cond && <X/>}` guard yields — not content.
    expect(projectRender(render, false, "PopoverTrigger")).toBe(render);
  });

  it("keeps the render element's own children and warns when both are given", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const render = createElement("button", null, "Own label");
    const out = projectRender(render, "Outer label", "PopoverTrigger");
    expect(childrenOf(out)).toBe("Own label");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("PopoverTrigger");
  });

  it("does not warn in the ordinary case", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    projectRender(createElement("button"), "Add item", "PopoverTrigger");
    expect(warn).not.toHaveBeenCalled();
  });

  it("accepts element children, not just text", () => {
    const render = createElement("button");
    const icon = createElement("svg");
    const out = projectRender(render, icon, "MenuTrigger");
    expect(isValidElement(childrenOf(out) as ReactElement)).toBe(true);
  });
});

describe("every render-prop trigger routes through projectRender", () => {
  // Guards against a new trigger being written in the old shape — which is how
  // all nine of them came to have the same bug.
  function tsxFiles(dir = "src/components"): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...tsxFiles(path));
      else if (entry.name.endsWith(".tsx")) out.push(path);
    }
    return out.sort();
  }

  it("never renders a bare {render}", () => {
    const offenders: string[] = [];
    for (const file of tsxFiles()) {
      const src = readFileSync(file, "utf8");
      // Only components that also accept `children` can drop them.
      if (!/\{ render, children,/.test(src)) continue;
      for (const [i, line] of src.split("\n").entries()) {
        if (/^\s*\{render\}\s*$/.test(line)) offenders.push(`${file}:${i + 1}`);
      }
    }
    expect(offenders, "use projectRender(render, children, name) instead").toEqual([]);
  });

  it("covers all nine known triggers", () => {
    const found = tsxFiles()
      .flatMap((f) => [...readFileSync(f, "utf8").matchAll(/projectRender\(render, children, "(\w+)"\)/g)])
      .map((m) => m[1]!)
      .sort();
    expect(found).toEqual([
      "AlertDialogTrigger",
      "DialogClose",
      "DialogTrigger",
      "HoverCardTrigger",
      "MenuTrigger",
      "PopoverClose",
      "PopoverTrigger",
      "SheetClose",
      "SheetTrigger",
    ]);
  });
});
