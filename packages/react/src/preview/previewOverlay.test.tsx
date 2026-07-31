// @vitest-environment jsdom
/**
 * Containment is the one behaviour a consumer can't verify by reading props:
 * it changes *where in the document* an overlay ends up. These assert the two
 * things the docs site depends on — that a contained overlay lands inside the
 * subtree it was rendered in, and that an explicitly-passed container still
 * wins over the ambient default.
 */
import { createRef, useEffect, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "../components/Dialog/index.js";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/Menu/index.js";
import { PreviewOverlayProvider } from "./previewOverlay.js";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // zag's popper measures with both; jsdom ships neither.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof matchMedia;
});

const mounted: Array<{ root: Root; host: HTMLElement }> = [];

function mount(ui: ReactNode): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(ui));
  mounted.push({ root, host });
  return host;
}

afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("PreviewOverlayProvider", () => {
  it("leaves an overlay portalled to the body by default", () => {
    const host = mount(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Delete project</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(host.querySelector(".dialog__popup")).toBeNull();
    expect(document.body.querySelector(".dialog__popup")).not.toBeNull();
  });

  it("renders a contained overlay inside the subtree that declared it", () => {
    const host = mount(
      <PreviewOverlayProvider contain>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Delete project</DialogTitle>
          </DialogContent>
        </Dialog>
      </PreviewOverlayProvider>,
    );

    // The point of the whole feature: an inspector scanning `host` finds it.
    expect(host.querySelector(".dialog__popup")).not.toBeNull();
    expect(host.querySelector(".dialog__title")?.textContent).toBe("Delete project");
  });

  it("contains a popper-positioned overlay too", () => {
    const host = mount(
      <PreviewOverlayProvider contain>
        <Menu defaultOpen>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuItem value="copy">Copy</MenuItem>
          </MenuContent>
        </Menu>
      </PreviewOverlayProvider>,
    );

    expect(host.querySelector(".menu__popup")).not.toBeNull();
  });

  it("opens when a controlled `open` flips true — the docs State-switch path", async () => {
    function Fixture({ open }: { open: boolean }) {
      return (
        <PreviewOverlayProvider contain>
          <Dialog open={open}>
            <DialogContent>
              <DialogTitle>Delete project</DialogTitle>
            </DialogContent>
          </Dialog>
        </PreviewOverlayProvider>
      );
    }

    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(<Fixture open={false} />));
    mounted.push({ root, host });

    expect(host.querySelector(".dialog__popup")?.getAttribute("data-state")).toBe("closed");

    // zag settles the controlled-prop watch (`CONTROLLED.OPEN`) asynchronously,
    // so a synchronous `act` sees the pre-transition DOM and reads "closed".
    await act(async () => {
      root.render(<Fixture open />);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const opened = host.querySelector(".dialog__popup");
    expect(opened?.getAttribute("data-state")).toBe("open");
    expect(opened?.hasAttribute("hidden")).toBe(false);
  });

  it("lets an explicit container beat the context", () => {
    function Fixture() {
      const ref = createRef<HTMLDivElement>();
      // Ark reads `container` into state on mount, so the target has to exist
      // before the overlay does — hence the two-pass render.
      const [ready, setReady] = useState(false);
      useEffect(() => setReady(true), []);
      return (
        <PreviewOverlayProvider contain>
          <div data-testid="target" ref={ref} />
          {ready && (
            <Dialog defaultOpen>
              <DialogContent container={ref}>
                <DialogTitle>Elsewhere</DialogTitle>
              </DialogContent>
            </Dialog>
          )}
        </PreviewOverlayProvider>
      );
    }

    const host = mount(<Fixture />);
    const target = host.querySelector<HTMLElement>('[data-testid="target"]');
    expect(target?.querySelector(".dialog__popup")).not.toBeNull();
  });
});
