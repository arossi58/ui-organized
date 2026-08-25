import { Component, ViewChild, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioContextMenu,
  UioContextMenuItem,
  UioContextMenuSeparator,
  UioContextMenuTrigger,
} from "./context-menu.js";

/**
 * Where a context menu goes, and what it is named after — the two things that
 * depend on a right-click having happened and are therefore unreachable from a
 * scenario whose step vocabulary has no right-click in it.
 *
 * Coordinates cannot be asserted here: jsdom measures every element as zero, so
 * the CDK has nothing to position against and any assertion about the pane's
 * left and top would be asserting zeroes. What *is* assertable is the input to
 * that positioning — the point the surface was told to sit at — which is
 * precisely what a wrong pointer handler gets wrong.
 */
@Component({
  standalone: true,
  imports: [UioContextMenu, UioContextMenuTrigger, UioContextMenuItem, UioContextMenuSeparator],
  template: `
    <div uioContextMenuTrigger [contextMenu]="m">Right-click here</div>
    <uio-context-menu #m="uioContextMenu">
      <div uioContextMenuItem value="a">Cut</div>
      <div uioContextMenuSeparator></div>
      <div uioContextMenuItem value="b">Delete</div>
    </uio-context-menu>
  `,
})
class Host {
  @ViewChild(UioContextMenu, { static: true }) menu!: UioContextMenu;
}

describe("UioContextMenu", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const area = fixture.nativeElement.querySelector('[data-part="context-trigger"]') as HTMLElement;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    const rightClick = (x: number, y: number) => {
      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y });
      area.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    return { fixture, area, content, rightClick };
  };

  it("opens at the pointer, and suppresses the browser's own menu", () => {
    const { fixture, content, rightClick } = render();
    const event = rightClick(120, 40);

    expect(content().getAttribute("data-state")).toBe("open");
    expect(fixture.componentInstance.menu.pointer.anchorPoint).toEqual({ x: 120, y: 40 });
    // Not prevented, and the browser's own context menu opens on top of this
    // one — which looks exactly like the component not working.
    expect(event.defaultPrevented).toBe(true);

    // A second right-click elsewhere moves the menu rather than leaving it
    // where the first one put it.
    rightClick(300, 200);
    expect(fixture.componentInstance.menu.pointer.anchorPoint).toEqual({ x: 300, y: 200 });
    fixture.destroy();
  });

  it("reports no placement until a pointer has placed it", () => {
    // Ark's own `defaultOpen` case reports neither `data-placement` nor
    // `data-side`: zag positions this surface against a virtual element at the
    // anchor point, and with no pointer there is nothing to measure. The CDK
    // would happily position against something and report a side the menu never
    // used, so the attribute is held back rather than being allowed to appear.
    const { fixture, content, rightClick } = render();
    fixture.componentInstance.menu.show();
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    expect(content().hasAttribute("data-placement")).toBe(false);

    rightClick(10, 10);
    expect(content().getAttribute("data-placement")).toBe("bottom-start");
    expect(content().getAttribute("data-side")).toBe("bottom");
    fixture.destroy();
  });

  it("names itself after the context trigger once one has been used", () => {
    // The same fork, in the accessible name. Before a right-click zag points
    // `aria-labelledby` at a plain trigger id that no element carries — a
    // dangling reference, reproduced because the four libraries have to render
    // the same thing and this is what Ark renders.
    const { fixture, area, content, rightClick } = render();
    fixture.componentInstance.menu.show();
    fixture.detectChanges();
    expect(content().getAttribute("aria-labelledby")).toMatch(/:trigger$/);
    expect(document.getElementById(content().getAttribute("aria-labelledby")!)).toBeNull();

    rightClick(10, 10);
    expect(content().getAttribute("aria-labelledby")).toBe(area.id);
    fixture.destroy();
  });

  it("dismisses on a left-click anywhere, the trigger area included", () => {
    // Unlike every other overlay here, whose trigger is excluded from "outside"
    // so a click cannot dismiss and re-open in one gesture. A context menu is
    // opened by a *right*-click, so a left-click on the area it covers is a
    // dismissal — which is what every desktop context menu does.
    const { fixture, area, content, rightClick } = render();
    rightClick(10, 10);
    expect(content().getAttribute("data-state")).toBe("open");

    area.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("highlights with the keyboard, and forgets the highlight on close", () => {
    const { fixture, content, rightClick } = render();
    rightClick(10, 10);
    expect(document.activeElement).toBe(content());

    content().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    const first = content().querySelector<HTMLElement>('[data-part="item"]')!;
    // Named rather than focused: DOM focus stays on the menu, which is what
    // `aria-activedescendant` and the stylesheet's `[data-highlighted]` need.
    expect(first.hasAttribute("data-highlighted")).toBe(true);
    expect(content().getAttribute("aria-activedescendant")).toBe(first.id);

    content().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    // The highlight goes with it: a menu that reopened still pointing at the
    // last thing chosen would arrow from there rather than from the top, which
    // is not what any of the four libraries do.
    expect(content().hasAttribute("aria-activedescendant")).toBe(false);
    fixture.destroy();
  });
});
