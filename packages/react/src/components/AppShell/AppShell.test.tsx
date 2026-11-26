// @vitest-environment jsdom
/**
 * What the parity gate cannot see: hydration, which a server-rendered page
 * goes through and a browser scenario never does, and the two ways the sheet
 * closes on its own, when the layout flips back to a rail and when a click in
 * it goes to a page.
 */
import { act } from "react";
import { renderToString } from "react-dom/server";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NavItem, NavSubItem, Sidebar } from "../Navigation/index.js";
import { AppHeader } from "./AppHeader.js";
import { AppShell } from "./AppShell.js";
import type { AppShellProps } from "./AppShell.types.js";

/** A matchMedia whose answer the test sets, and changes, by hand. */
let narrow = false;
const listeners = new Set<() => void>();
function setNarrow(next: boolean) {
  narrow = next;
  act(() => {
    for (const listener of listeners) listener();
  });
}

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia = ((query: string) => ({
    get matches() {
      return narrow;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof matchMedia;
});

beforeEach(() => {
  narrow = false;
  listeners.clear();
});

const mounted: Array<{ root: Root; host: HTMLElement }> = [];
afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
  document.body.innerHTML = "";
});

function Shell(props: Partial<AppShellProps>) {
  return (
    <AppShell
      header={<AppHeader logo={<span>Acme</span>} />}
      sidebar={
        <Sidebar>
          <NavItem label="Reports" />
        </Sidebar>
      }
      {...props}
    >
      <p>Page</p>
    </AppShell>
  );
}

function mount(props: Partial<AppShellProps> = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(<Shell {...props} />));
  mounted.push({ root, host });
  return host;
}

const menuButton = () => document.querySelector<HTMLButtonElement>(".app-header__menu");
const sheet = () => document.querySelector<HTMLElement>(".app-shell__sheet");

describe("AppShell", () => {
  it("renders a rail on the server, with no layout until the page runs", () => {
    const html = renderToString(<Shell />);
    expect(html).toContain('class="app-shell__sidebar"');
    expect(html).not.toContain("data-layout");
    expect(html).not.toContain("app-header__menu");
    // A forced layout is known up front.
    expect(renderToString(<Shell layout="sheet" />)).toContain('data-layout="sheet"');
  });

  it("hydrates the server's markup without a mismatch, then moves the sidebar into a sheet", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(<Shell />);
    document.body.append(host);
    narrow = true;
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let root!: Root;
    act(() => {
      root = hydrateRoot(host, <Shell />);
    });
    mounted.push({ root, host });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    expect(host.querySelector(".app-shell")?.getAttribute("data-layout")).toBe("sheet");
    expect(host.querySelector(".app-shell__sidebar")).toBeNull();
    expect(menuButton()).not.toBeNull();
  });

  // Opened through the props, not the menu button: zag's dialog trigger does
  // not answer a jsdom click (a bare Sheet's does not either). The button
  // itself is driven in a browser, by the parity scenarios and Storybook.
  it("closes the sheet when the layout flips back to a rail, and says so", () => {
    narrow = true;
    const onNavOpenChange = vi.fn();
    const onLayoutChange = vi.fn();
    mount({ navOpen: true, onNavOpenChange, onLayoutChange });
    expect(onLayoutChange).toHaveBeenLastCalledWith("sheet");
    expect(menuButton()).not.toBeNull();
    expect(sheet()).not.toBeNull();
    // The rail it rendered before measuring did not count as a flip.
    expect(onNavOpenChange).not.toHaveBeenCalled();

    setNarrow(false);
    expect(onLayoutChange).toHaveBeenLastCalledWith("rail");
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
    expect(sheet()).toBeNull();
    expect(document.querySelector(".app-shell__sidebar .sidebar")).not.toBeNull();
  });

  it("closes the sheet when a click in it goes to a page, and not on one that opens sub-pages", () => {
    const onNavOpenChange = vi.fn();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() =>
      root.render(
        <AppShell
          layout="sheet"
          defaultNavOpen
          onNavOpenChange={onNavOpenChange}
          sidebar={
            <Sidebar>
              <NavItem label="Reports">
                <NavSubItem label="Weekly" />
              </NavItem>
              <NavItem label="Settings" />
            </Sidebar>
          }
        />,
      ),
    );
    mounted.push({ root, host });
    const [reports, settings] = sheet()!.querySelectorAll<HTMLButtonElement>(".nav-item__trigger");
    act(() => reports!.click());
    expect(onNavOpenChange).not.toHaveBeenCalled();
    act(() => sheet()!.querySelector<HTMLButtonElement>(".nav-sub-item")!.click());
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
    onNavOpenChange.mockClear();
    act(() => settings!.click());
    expect(onNavOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the sidebar expanded and without its toggle in the sheet", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() =>
      root.render(
        <AppShell
          layout="sheet"
          defaultNavOpen
          sidebar={
            <Sidebar collapsible defaultCollapsed>
              <NavItem label="Reports" />
            </Sidebar>
          }
        />,
      ),
    );
    mounted.push({ root, host });
    const sidebar = sheet()!.querySelector(".sidebar")!;
    expect(sidebar.classList).not.toContain("sidebar--collapsed");
    expect(sidebar.querySelector(".sidebar__toggle")).toBeNull();
  });
});
