// @vitest-environment jsdom
/**
 * `<Icon name>` takes the library's own names and nothing else.
 *
 * - a string resolves only to an icon registered under that native name, in
 *   the active library — `x` in Lucide, `x-mark` in Heroicons, never both;
 * - the components' own glyphs follow whichever library is active, without any
 *   registration, and are not reachable by a string;
 * - an unregistered name renders nothing and says why, once.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Icon } from "./Icon.js";
import { IconProvider } from "../../context/IconContext.js";
import { lucideIcons, registerIcons as registerLucide } from "../../icons/entry-lucide.js";
import { registerIcons as registerHeroicons } from "../../icons/entry-heroicons.js";
import { glyph } from "../../icons/glyph.js";
import { resetIconSetWarnings } from "./warnMissingIconSet.js";
import "../../icons/entry-heroicons.js";

const Marker = (label: string) => {
  const C = (props: Record<string, unknown>) => (
    <svg data-icon={label} data-size={String(props.size ?? props.width)} />
  );
  C.displayName = label;
  return C;
};

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  registerLucide({ Camera: Marker("lucide-camera"), "arrow-down-0-1": Marker("lucide-0-1") });
  registerHeroicons({ XMarkIcon: Marker("hero-x-mark") });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  resetIconSetWarnings();
  vi.restoreAllMocks();
});

function render(ui: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(ui));
  return container;
}

const drawn = (el: HTMLElement) => el.querySelector("svg")?.getAttribute("data-icon") ?? null;

describe("Icon names", () => {
  it("renders a registered icon by its native name", () => {
    expect(drawn(render(<Icon name="camera" />))).toBe("lucide-camera");
  });

  it("keeps a native key as given", () => {
    expect(drawn(render(<Icon name="arrow-down-0-1" />))).toBe("lucide-0-1");
  });

  it("does not translate names between libraries", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = render(
      <IconProvider library="lucide" style="outline" strokeAdjustment={false}>
        <Icon name="x-mark" />
      </IconProvider>,
    );
    expect(el.querySelector("svg")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain('<Icon name="x-mark">');
  });

  it("resolves a name in the active library only", () => {
    const el = render(
      <IconProvider library="heroicons" style="outline" strokeAdjustment={false}>
        <Icon name="x-mark" />
      </IconProvider>,
    );
    expect(drawn(el)).toBe("hero-x-mark");
  });

  it("does not expose the components' glyph keys as names", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(render(<Icon name="x" />).querySelector("svg")).toBeNull();
  });

  it("warns once per name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Icon name="rocket" />
        <Icon name="rocket" />
      </>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("internal glyphs", () => {
  it("follow the active library without registration", () => {
    const lucide = render(<Icon name={glyph("close")} />).querySelector("svg");
    expect(lucide).not.toBeNull();
    act(() => root.unmount());
    container.remove();

    const hero = render(
      <IconProvider library="heroicons" style="outline" strokeAdjustment={false}>
        <Icon name={glyph("close")} />
      </IconProvider>,
    ).querySelector("svg");
    expect(hero).not.toBeNull();
    // Different libraries, different components.
    expect(lucideIcons.outline.close).toBeDefined();
  });

  it("is the same value every time, so it is stable across renders", () => {
    expect(glyph("check")).toBe(glyph("check"));
  });
});
