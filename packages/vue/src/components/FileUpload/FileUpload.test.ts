// @vitest-environment jsdom
//
// Set per file, as the calendar test does: only a few Vue tests need a document.
import { describe, it, expect, afterEach, vi } from "vitest";
import { createApp, h, nextTick, type App } from "vue";
import FileUpload from "./FileUpload.vue";

/**
 * The upload state of each row comes from the caller, through `fileStatus`.
 * The parity gate cannot put a File into the list, so the rows are asserted
 * here, as the other libraries' are.
 */
const file = (name: string) => new File(["x".repeat(10)], name, { type: "text/plain" });

let app: App | null = null;
let host: HTMLElement | null = null;
afterEach(() => {
  app?.unmount();
  host?.remove();
  app = null;
  host = null;
});

async function mount(props: Record<string, unknown>) {
  host = document.createElement("div");
  document.body.append(host);
  app = createApp({ render: () => h(FileUpload, props) });
  app.mount(host);
  await nextTick();
  await nextTick();
  return host;
}

describe("FileUpload upload state", () => {
  it("shows progress, named for the file, while it uploads", async () => {
    const el = await mount({ defaultAcceptedFiles: [file("a.txt")], fileStatus: () => ({ progress: 45 }) });
    const row = el.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("uploading");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Uploading 45%");
    const bar = row.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-label")).toBe("Uploading a.txt");
    expect(bar.getAttribute("aria-valuenow")).toBe("45");
  });

  it("shows the error and a retry bound with @retry", async () => {
    const onRetry = vi.fn();
    const el = await mount({
      defaultAcceptedFiles: [file("a.txt")],
      fileStatus: () => ({ error: "Network lost" }),
      onRetry,
    });
    const row = el.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("error");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Network lost");
    row.querySelector<HTMLButtonElement>(".file-upload__item-retry")!.click();
    expect(onRetry.mock.calls[0]![0].name).toBe("a.txt");
  });
});
