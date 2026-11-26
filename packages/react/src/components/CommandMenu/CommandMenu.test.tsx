// @vitest-environment jsdom
/**
 * What the parity gate cannot see: what `onSelect` is called with, whether
 * the menu closes after it, that a reopened menu has forgotten its query (the
 * query is the input's `value` property, not an attribute), and the hotkey.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { CommandMenu } from "./CommandMenu.js";
import type { CommandMenuItem } from "./CommandMenu.types.js";
import { registerIconSet } from "../../icons/registry.js";

const ITEMS: CommandMenuItem[] = [
  { value: "new", label: "New file", group: "File", shortcut: ["mod", "n"] },
  { value: "open", label: "Open file", group: "File" },
  { value: "settings", label: "Settings", group: "General", keywords: ["preferences"] },
];

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  });
  (globalThis as { CSS?: { escape(value: string): string } }).CSS ??= {
    escape: (value) => value.replace(/[^\w-]/g, (c) => `\\${c}`),
  };
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const mounted: Array<{ root: Root; host: HTMLElement }> = [];
function mount(ui: ReactNode) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(ui));
  mounted.push({ root, host });
}
afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

const settle = () => act(async () => {});
const input = () => document.querySelector<HTMLInputElement>(".command-menu__input");
const rows = () => [...document.querySelectorAll<HTMLElement>(".command-menu__item")];
/**
 * The row the search box names as its active descendant, which is what a
 * screen reader follows. zag paints `data-highlighted` only once its input has
 * had a focus event, which jsdom's focus trap delivers before the machine runs.
 */
const highlighted = () => {
  const id = input()?.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};
const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
const type = async (text: string) => {
  act(() => {
    setNativeValue.call(input()!, text);
    input()!.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await settle();
};
const key = async (target: EventTarget, init: KeyboardEventInit) => {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }),
    );
  });
  await settle();
};

describe("CommandMenu", () => {
  it("filters as you type, and highlights the first match each time", async () => {
    mount(<CommandMenu items={ITEMS} defaultOpen />);
    await settle();
    expect(rows()).toHaveLength(3);
    expect(highlighted()).toContain("New file");

    await type("prefer");
    expect(rows().map((row) => row.textContent)).toEqual(["Settings"]);
    expect(highlighted()).toBe("Settings");
  });

  it("runs the highlighted command on Enter, with its value, and closes", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    mount(
      <CommandMenu items={ITEMS} defaultOpen onSelect={onSelect} onOpenChange={onOpenChange} />,
    );
    await settle();
    await type("open");
    await key(input()!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("open");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("stays open after a command with closeOnSelect off, and reports every pick", async () => {
    const onSelect = vi.fn();
    mount(<CommandMenu items={ITEMS} defaultOpen closeOnSelect={false} onSelect={onSelect} />);
    await settle();
    await key(input()!, { key: "Enter" });
    await key(input()!, { key: "Enter" });
    // The list holds no selection, so a second pick of the same row is a new one.
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(input()).not.toBeNull();
  });

  it("toggles on its hotkey, and forgets the query when it closes", async () => {
    const onOpenChange = vi.fn();
    mount(<CommandMenu items={ITEMS} hotkey="mod+k" onOpenChange={onOpenChange} />);
    // jsdom reports no Apple platform, so mod is Ctrl.
    await key(document, { key: "k", ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await type("set");
    expect(rows()).toHaveLength(1);

    await key(document, { key: "k", ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await key(document, { key: "k", ctrlKey: true });
    expect(input()!.value).toBe("");
    expect(rows()).toHaveLength(3);
  });

  it("ignores the hotkey with other modifiers held", async () => {
    const onOpenChange = vi.fn();
    mount(<CommandMenu items={ITEMS} hotkey="mod+k" onOpenChange={onOpenChange} />);
    await key(document, { key: "K", ctrlKey: true, shiftKey: true });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("listens for nothing without a hotkey", async () => {
    const onOpenChange = vi.fn();
    mount(<CommandMenu items={ITEMS} onOpenChange={onOpenChange} />);
    await key(document, { key: "k", ctrlKey: true });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
