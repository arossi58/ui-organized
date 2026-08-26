import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioFileUpload, acceptsFile, formatFileSize } from "./file-upload.js";

/**
 * Everything about this component that involves an actual file.
 *
 * The parity gate compares the empty control and nothing else, and that is a
 * limit rather than a choice: a populated row needs real `File` objects, which
 * arrive only through `setInputFiles` or a synthesised drop — neither of which
 * a scenario's JSON props can express. Here a `File` is one constructor call.
 *
 * What that leaves to assert is the part most likely to be wrong: which files
 * are turned away and why. `accept` on the hidden input is advisory, a drop
 * skips it entirely, and a component that trusted the picker would take a
 * `.exe` dropped on a dropzone declaring `image/*`.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioFileUpload],
  template: `<div uioFileUpload></div>`,
})
class Host {
  @ViewChild(UioFileUpload, { static: true }) upload!: UioFileUpload;
}

const file = (name: string, type: string, size = 8) =>
  new File(["x".repeat(size)], name, { type });

describe("UioFileUpload", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.upload;
    const instance = component as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const dropzone = () => host.querySelector<HTMLElement>('[data-part="dropzone"]')!;
    const rows = () => [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    const names = () =>
      [...host.querySelectorAll<HTMLElement>('[data-part="item-name"]')].map((el) =>
        el.textContent?.trim(),
      );
    const rejections: { file: File; errors: string[] }[] = [];
    component.fileReject.subscribe((list) => rejections.push(...list));

    /**
     * A plain event with `dataTransfer` bolted on, because jsdom has neither a
     * constructible `DragEvent` nor a `DataTransfer`. The component reads
     * `files` and `dropEffect` and nothing else.
     */
    const drop = (files: File[]) => {
      dropzone().dispatchEvent(
        Object.assign(new Event("drop", { bubbles: true, cancelable: true }), {
          dataTransfer: { files, types: ["Files"] },
        }),
      );
      fixture.detectChanges();
    };
    const dragOver = () => {
      dropzone().dispatchEvent(
        Object.assign(new Event("dragover", { bubbles: true, cancelable: true }), {
          dataTransfer: { files: [], types: ["Files"] },
        }),
      );
      fixture.detectChanges();
    };
    return { fixture, host, component, dropzone, rows, names, rejections, drop, dragOver };
  };

  it("formats a size the way every other library in the system does", () => {
    // Decimal, three significant figures — which is what makes 1536 read as
    // 1.54 kB rather than 1.5 KiB.
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(5)).toBe("5 byte");
    expect(formatFileSize(1000)).toBe("1 kB");
    expect(formatFileSize(1536)).toBe("1.54 kB");
    expect(formatFileSize(1_500_000)).toBe("1.5 MB");
  });

  it("matches an accept list the way a file picker would", () => {
    const png = file("a.png", "image/png");
    expect(acceptsFile(png, undefined)).toBe(true);
    expect(acceptsFile(png, "image/*")).toBe(true);
    expect(acceptsFile(png, "image/png")).toBe(true);
    expect(acceptsFile(png, ".png")).toBe(true);
    expect(acceptsFile(png, "application/pdf,.txt")).toBe(false);
    // Extension matching is on the name, so a file with no MIME type still
    // passes a `.pdf` filter — which is exactly what a browser does.
    expect(acceptsFile(file("report.pdf", ""), ".pdf")).toBe(true);
  });

  it("shows a dropped file as a row, with its name and size", () => {
    const { names, host, drop } = render();
    drop([file("notes.txt", "text/plain", 5)]);
    expect(names()).toEqual(["notes.txt"]);
    expect(host.querySelector('[data-part="item-size-text"]')!.textContent?.trim()).toBe("5 byte");
  });

  it("turns away a dropped file the accept list does not cover", () => {
    const { names, rejections, drop } = render({ accept: "image/*" });
    drop([file("notes.txt", "text/plain")]);
    expect(names()).toEqual([]);
    // The picker's own filter never ran — a drop goes straight past it — so
    // this is the check that actually enforces `accept`.
    expect(rejections[0]?.errors).toEqual(["FILE_INVALID_TYPE"]);
  });

  it("turns away a file outside the size bounds", () => {
    const tooBig = render({ maxFileSize: 4 });
    tooBig.drop([file("big.txt", "text/plain", 10)]);
    expect(tooBig.rejections[0]?.errors).toEqual(["FILE_TOO_LARGE"]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const tooSmall = render({ minFileSize: 16 });
    tooSmall.drop([file("small.txt", "text/plain", 2)]);
    expect(tooSmall.rejections[0]?.errors).toEqual(["FILE_TOO_SMALL"]);
  });

  it("takes none of a batch that would overflow maxFiles", () => {
    const { names, rejections, drop } = render({ maxFiles: 2 });
    drop([file("a.txt", "text/plain"), file("b.txt", "text/plain"), file("c.txt", "text/plain")]);
    // All or nothing past the cap: a partial accept would leave the user
    // guessing which of their files got in.
    expect(names()).toEqual([]);
    expect(rejections.map((entry) => entry.errors[0])).toEqual([
      "TOO_MANY_FILES",
      "TOO_MANY_FILES",
      "TOO_MANY_FILES",
    ]);
  });

  it("appends when several files are allowed and replaces when one is", () => {
    const many = render({ maxFiles: 3 });
    many.drop([file("a.txt", "text/plain")]);
    many.drop([file("b.txt", "text/plain")]);
    expect(many.names()).toEqual(["a.txt", "b.txt"]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const one = render();
    one.drop([file("a.txt", "text/plain")]);
    one.drop([file("b.txt", "text/plain")]);
    // Single-file mode is a replacement, so the one row a caller asked for
    // stays one row.
    expect(one.names()).toEqual(["b.txt"]);
  });

  it("refuses the same file twice", () => {
    const { names, rejections, drop } = render({ maxFiles: 3 });
    drop([file("a.txt", "text/plain")]);
    drop([file("a.txt", "text/plain")]);
    expect(names()).toEqual(["a.txt"]);
    expect(rejections[0]?.errors).toEqual(["FILE_EXISTS"]);
  });

  it("marks the dropzone while a drag is over it", () => {
    const { dropzone, dragOver, drop } = render();
    dragOver();
    // What the dropzone's highlight is drawn from, and the one state a static
    // render can never reach.
    expect(dropzone().getAttribute("data-dragging")).toBe("");
    drop([file("a.txt", "text/plain")]);
    expect(dropzone().hasAttribute("data-dragging")).toBe(false);
  });

  it("ignores a drop when dropping is switched off", () => {
    const { names, drop } = render({ allowDrop: false });
    drop([file("a.txt", "text/plain")]);
    expect(names()).toEqual([]);
  });

  it("removes a row through its delete trigger", () => {
    const { fixture, host, names, drop } = render({ maxFiles: 2 });
    drop([file("a.txt", "text/plain"), file("b.txt", "text/plain")]);
    host.querySelectorAll<HTMLButtonElement>('[data-part="item-delete-trigger"]')[0]!.click();
    fixture.detectChanges();
    expect(names()).toEqual(["b.txt"]);
  });

  it("takes files chosen through the picker as well as dropped ones", () => {
    const { fixture, host, names } = render();
    const input = host.querySelector<HTMLInputElement>('input[type="file"]')!;
    // jsdom has no way to build a `FileList`, and the handler only reads
    // `files` off the element — so the property stands in for one.
    Object.defineProperty(input, "files", { value: [file("picked.txt", "text/plain")] });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(names()).toEqual(["picked.txt"]);
  });

  it("refuses everything while disabled", () => {
    const { names, dropzone, drop } = render({ disabledInput: true });
    drop([file("a.txt", "text/plain")]);
    expect(names()).toEqual([]);
    expect(dropzone().getAttribute("aria-disabled")).toBe("true");
    expect(dropzone().hasAttribute("tabindex")).toBe(false);
  });
});
