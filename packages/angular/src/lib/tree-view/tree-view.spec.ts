import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioTreeView, type TreeViewNode } from "./tree-view.js";

/**
 * Everything about a tree that a rendered comparison cannot reach: the
 * disclosure keys, and where the browser's focus actually is.
 *
 * `data-focus` is the keyboard highlight in the shared stylesheet, and the whole
 * risk in a roving tabindex is that the attribute and the focus come apart — a
 * row that reports the highlight without holding focus looks perfect and leaves
 * the next Tab starting from the top of the page. The parity gate can see the
 * attribute; only a spec can see the two together.
 */
const items: TreeViewNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "app.ts" },
      { id: "lib", label: "lib", children: [{ id: "util", label: "util.ts" }] },
    ],
  },
  { id: "readme", label: "README.md" },
];

@Component({
  standalone: true,
  imports: [UioTreeView],
  template: `<div uioTreeView></div>`,
})
class Host {
  @ViewChild(UioTreeView, { static: true }) tree!: UioTreeView;
}

describe("UioTreeView", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /** Inputs are initializer-based, and JIT registers none — see `sheet.spec.ts`. */
  const render = (nodes: TreeViewNode[] = items, expanded: string[] = []) => {
    const fixture = TestBed.createComponent(Host);
    const tree = fixture.componentInstance.tree as unknown as Record<string, unknown>;
    tree["items"] = signal(nodes);
    tree["label"] = signal("Files");
    tree["expandedValue"] = signal(expanded);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[uioTreeView]") as HTMLElement;
    const row = (value: string) =>
      root.querySelector<HTMLElement>(
        `[data-part="branch-control"][data-value="${value}"], [data-part="item"][data-value="${value}"]`,
      )!;
    const branch = (value: string) =>
      root.querySelector<HTMLElement>(`[data-part="branch"][data-value="${value}"]`)!;
    const panel = (value: string) =>
      root.querySelector<HTMLElement>(`[data-part="branch-content"][data-value="${value}"]`)!;
    const press = (key: string) => {
      root
        .querySelector('[data-part="tree"]')!
        .dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, root, row, branch, panel, press };
  };

  it("starts the roving tabindex on the first node that is not disabled", () => {
    // Zag's `focusedValue` default, and it is what makes the tree reachable at
    // all: the tree itself is `tabindex="-1"`, so without one row at `0` the
    // first Tab walks straight past it.
    const { fixture, row } = render([
      { id: "one", label: "One", disabled: true },
      { id: "two", label: "Two" },
    ]);
    expect(row("one").getAttribute("tabindex")).toBe("-1");
    expect(row("two").getAttribute("tabindex")).toBe("0");
    expect(row("two").hasAttribute("data-focus")).toBe(true);
    fixture.destroy();
  });

  it("opens and closes a branch, and hides the panel with it", () => {
    const { fixture, row, branch, panel } = render();
    expect(branch("src").getAttribute("aria-expanded")).toBe("false");
    expect(panel("src").hasAttribute("hidden")).toBe(true);

    row("src").click();
    fixture.detectChanges();
    expect(branch("src").getAttribute("aria-expanded")).toBe("true");
    expect(panel("src").hasAttribute("hidden")).toBe(false);
    // Absent while settled open, never `data-state="open"`: Ark builds each
    // branch out of a Collapsible and drops the attribute once the enter
    // animation is over. See `UioCollapsibleContext`.
    expect(panel("src").hasAttribute("data-state")).toBe(false);

    row("src").click();
    fixture.detectChanges();
    expect(panel("src").getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("moves real focus with the arrow keys, not just the attribute", () => {
    const { fixture, row, press } = render(items, ["src"]);
    row("src").focus();
    fixture.detectChanges();

    press("ArrowDown");
    expect(document.activeElement).toBe(row("app"));
    expect(row("app").hasAttribute("data-focus")).toBe(true);
    expect(row("app").getAttribute("tabindex")).toBe("0");
    // And the row it came from gives both up, or Tab would find two stops.
    expect(row("src").hasAttribute("data-focus")).toBe(false);
    expect(row("src").getAttribute("tabindex")).toBe("-1");

    press("ArrowUp");
    expect(document.activeElement).toBe(row("src"));
    fixture.destroy();
  });

  it("steps over the rows inside a collapsed branch", () => {
    // The children are still rendered — hidden, not absent — so a walk that
    // read the DOM rather than the expansion state would focus an element the
    // browser cannot focus, and focus would fall silently to the body.
    const { fixture, row, press } = render();
    row("src").focus();
    fixture.detectChanges();
    press("ArrowDown");
    expect(document.activeElement).toBe(row("readme"));
    fixture.destroy();
  });

  it("uses the left and right arrows as the disclosure keys", () => {
    const { fixture, row, branch, press } = render();
    row("src").focus();
    fixture.detectChanges();

    // Right on a closed branch opens it; right again steps into it.
    press("ArrowRight");
    expect(branch("src").getAttribute("aria-expanded")).toBe("true");
    press("ArrowRight");
    expect(document.activeElement).toBe(row("app"));

    // Left on a leaf steps out to the parent; left again closes it.
    press("ArrowLeft");
    expect(document.activeElement).toBe(row("src"));
    press("ArrowLeft");
    expect(branch("src").getAttribute("aria-expanded")).toBe("false");
    fixture.destroy();
  });

  it("runs to the ends with Home and End", () => {
    const { fixture, row, press } = render(items, ["src", "lib"]);
    row("app").focus();
    fixture.detectChanges();
    press("End");
    expect(document.activeElement).toBe(row("readme"));
    press("Home");
    expect(document.activeElement).toBe(row("src"));
    fixture.destroy();
  });

  it("selects one node at a time, and several when asked to", () => {
    const { fixture, row } = render();
    row("readme").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tree.selectedValue()).toEqual(["readme"]);

    row("src").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tree.selectedValue()).toEqual(["src"]);

    (fixture.componentInstance.tree as unknown as Record<string, unknown>)["selectionMode"] =
      signal("multiple");
    row("readme").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tree.selectedValue()).toEqual(["src", "readme"]);
    // And a second click on a selected node takes it back out, which is the
    // only way to deselect in a multiple tree.
    row("readme").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tree.selectedValue()).toEqual(["src"]);
    fixture.destroy();
  });

  it("refuses to select a disabled node", () => {
    const { fixture, row } = render([
      { id: "one", label: "One", disabled: true },
      { id: "two", label: "Two" },
    ]);
    row("one").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tree.selectedValue()).toEqual([]);
    fixture.destroy();
  });
});
