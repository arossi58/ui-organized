import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import FileUpload from "./FileUpload.svelte";

/**
 * The upload state of each row comes from the caller, through `fileStatus`.
 * The parity gate cannot put a File into the list, so the rows are asserted
 * here, as React's and Angular's are.
 */
const file = (name: string) => new File(["x".repeat(10)], name, { type: "text/plain" });

describe("FileUpload upload state", () => {
  it("shows progress, named for the file, while it uploads", async () => {
    const { container } = render(FileUpload, {
      defaultAcceptedFiles: [file("a.txt")],
      fileStatus: () => ({ progress: 45 }),
    });
    await tick();
    const row = container.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("uploading");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Uploading 45%");
    const bar = row.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-label")).toBe("Uploading a.txt");
    expect(bar.getAttribute("aria-valuenow")).toBe("45");
  });

  it("shows the error and a retry that hands back the file", async () => {
    const onRetry = vi.fn();
    const { container } = render(FileUpload, {
      defaultAcceptedFiles: [file("a.txt")],
      fileStatus: () => ({ error: "Network lost" }),
      onRetry,
    });
    await tick();
    const row = container.querySelector(".file-upload__item")!;
    expect(row.getAttribute("data-status")).toBe("error");
    expect(row.querySelector(".file-upload__item-status")!.textContent).toBe("Network lost");
    row.querySelector<HTMLButtonElement>(".file-upload__item-retry")!.click();
    expect(onRetry.mock.calls[0]![0].name).toBe("a.txt");
  });
});
