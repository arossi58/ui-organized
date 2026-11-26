// @vitest-environment jsdom
/**
 * The upload state of each row comes from the caller, through `fileStatus`:
 * the component never uploads anything itself. The parity gate cannot put a
 * File into the list, so the rows are asserted here.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { FileUpload } from "./FileUpload.js";
import { registerIconSet } from "../../icons/registry.js";

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  } as never);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render(node: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(node));
  return container;
}

const file = (name: string) => new File(["x".repeat(10)], name, { type: "text/plain" });

describe("FileUpload upload state", () => {
  it("leaves a row alone when nothing reports on it", async () => {
    const el = await render(<FileUpload defaultAcceptedFiles={[file("a.txt")]} />);
    const row = el.querySelector(".file-upload__item")!;
    expect(row.hasAttribute("data-status")).toBe(false);
    expect(row.querySelector(".file-upload__item-size")).not.toBeNull();
    expect(row.querySelector('[role="progressbar"]')).toBeNull();
  });

  it("shows progress, named for the file, while it uploads", async () => {
    const el = await render(
      <FileUpload defaultAcceptedFiles={[file("a.txt")]} fileStatus={() => ({ progress: 45 })} />,
    );
    const row = el.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("uploading");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Uploading 45%");
    const bar = row.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-label")).toBe("Uploading a.txt");
    expect(bar.getAttribute("aria-valuenow")).toBe("45");
  });

  it("treats 100% as done", async () => {
    const el = await render(
      <FileUpload defaultAcceptedFiles={[file("a.txt")]} fileStatus={() => ({ progress: 100 })} />,
    );
    expect(el.querySelector(".file-upload__item")!.hasAttribute("data-status")).toBe(false);
  });

  it("shows the error and a retry that hands back the file", async () => {
    const onRetry = vi.fn();
    const a = file("a.txt");
    const el = await render(
      <FileUpload defaultAcceptedFiles={[a]} fileStatus={() => ({ error: "Network lost" })} onRetry={onRetry} />,
    );
    const row = el.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("error");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Network lost");
    const retry = row.querySelector<HTMLButtonElement>(".file-upload__item-retry")!;
    expect(retry.getAttribute("aria-label")).toBe("Retry a.txt");
    act(() => retry.click());
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0]![0].name).toBe("a.txt");
  });

  it("offers no retry without onRetry", async () => {
    const el = await render(
      <FileUpload defaultAcceptedFiles={[file("a.txt")]} fileStatus={() => ({ error: "Network lost" })} />,
    );
    expect(el.querySelector(".file-upload__item-retry")).toBeNull();
  });
});
