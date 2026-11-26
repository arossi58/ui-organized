import {
  Component,
  ContentChild,
  Input,
  Output,
  ViewChild,
  provideZonelessChangeDetection,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { UioAppHeader, UioAppHeaderLogo, UioAppShell, UioAppShellSidebar } from "./app-shell.js";
import { UioNavItem, UioSidebar } from "../navigation/navigation.js";
import { UioSheet } from "../sheet/sheet.js";

/**
 * What the parity harness cannot reach: the viewport changing under a running
 * page, which is what flips the layout and must close an open sheet, and the
 * sidebar template rendered with the sheet's injector, which is what keeps it
 * expanded there and closes the sheet on a click that navigates.
 */

/**
 * JIT registers no initializer APIs (see sheet.spec.ts): not `input()`, not
 * `model()`, not `contentChild()`. This is what the CLI's JIT transform does:
 * mark each field with the decorator the AOT compiler would have emitted. A
 * model is an input plus an output named `<name>Change`.
 */
const signalInputs: Array<[object, string]> = [
  [UioAppShell.prototype, "layout"],
  [UioSheet.prototype, "side"],
  [UioSheet.prototype, "size"],
  [UioSheet.prototype, "panelClass"],
  [UioSheet.prototype, "open"],
  [UioNavItem.prototype, "label"],
  [UioSidebar.prototype, "collapsible"],
  [UioSidebar.prototype, "collapsed"],
];
for (const [proto, name] of signalInputs) {
  Input({ isSignal: true, alias: name } as Input)(proto, name);
}
Output("openChange")(UioSheet.prototype, "open");
ContentChild(UioAppShellSidebar, { isSignal: true } as never)(
  UioAppShell.prototype,
  "sidebar",
);
ContentChild(UioAppHeaderLogo, { isSignal: true } as never)(UioAppHeader.prototype, "logo");

@Component({
  standalone: true,
  imports: [
    UioAppShell,
    UioAppShellSidebar,
    UioAppHeader,
    UioAppHeaderLogo,
    UioSidebar,
    UioNavItem,
  ],
  template: `
    <div uioAppShell>
      <header uioAppHeader><div uioAppHeaderLogo>Acme</div></header>
      <ng-template uioAppShellSidebar>
        <div uioSidebar collapsible [collapsed]="true">
          <div uioNavItem label="Reports"></div>
          <div uioNavItem label="Settings"></div>
        </div>
      </ng-template>
      <p>Page</p>
    </div>
  `,
})
class Host {
  @ViewChild(UioAppShell, { static: true }) shell!: UioAppShell;
}

/** A matchMedia whose answer the test sets, and changes, by hand. */
let narrow = false;
const listeners = new Set<() => void>();
function setNarrow(next: boolean) {
  narrow = next;
  for (const listener of listeners) listener();
}

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    get matches() {
      return narrow;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof matchMedia;
});

describe("UioAppShell", () => {
  beforeEach(() => {
    narrow = false;
    listeners.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.innerHTML = "";
  });

  const render = async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.append(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const sheet = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]');
    const menu = () => root.querySelector<HTMLButtonElement>(".app-header__menu");
    return { fixture, root, settle, sheet, menu, shell: fixture.componentInstance.shell };
  };

  it("renders a rail first, then the layout the viewport asks for", async () => {
    narrow = true;
    const { root, menu } = await render();
    const shell = root.querySelector(".app-shell")!;
    expect(shell.getAttribute("data-layout")).toBe("sheet");
    expect(root.querySelector(".app-shell__sidebar")).toBeNull();
    expect(menu()).not.toBeNull();
    expect(root.querySelector("main.app-shell__main")?.id).toMatch(/^app-shell-main-/);
  });

  it("opens the sheet from the menu button and closes it on a click that navigates", async () => {
    narrow = true;
    const { shell, sheet, menu, settle } = await render();
    menu()!.click();
    await settle();
    expect(shell.navOpen()).toBe(true);
    expect(sheet()?.getAttribute("data-state")).toBe("open");
    const items = sheet()!.querySelectorAll<HTMLButtonElement>(".nav-item__trigger");
    expect(items).toHaveLength(2);
    items[1]!.click();
    await settle();
    expect(shell.navOpen()).toBe(false);
  });

  it("keeps the sidebar expanded and without its toggle in the sheet, and collapsed in the rail", async () => {
    narrow = true;
    const { root, sheet, menu, settle } = await render();
    menu()!.click();
    await settle();
    const inSheet = sheet()!.querySelector(".sidebar")!;
    expect(inSheet.classList).not.toContain("sidebar--collapsed");
    expect(inSheet.querySelector(".sidebar__toggle")).toBeNull();

    setNarrow(false);
    await settle();
    const rail = root.querySelector(".app-shell__sidebar .sidebar")!;
    expect(rail.classList).toContain("sidebar--collapsed");
    expect(rail.querySelector(".sidebar__toggle")).not.toBeNull();
  });

  it("closes an open sheet when the layout flips back to a rail", async () => {
    narrow = true;
    const { root, shell, menu, settle } = await render();
    menu()!.click();
    await settle();
    expect(shell.navOpen()).toBe(true);

    setNarrow(false);
    await settle();
    expect(root.querySelector(".app-shell")!.getAttribute("data-layout")).toBe("rail");
    expect(shell.navOpen()).toBe(false);
    expect(root.querySelector(".app-header__menu")).toBeNull();
  });
});
