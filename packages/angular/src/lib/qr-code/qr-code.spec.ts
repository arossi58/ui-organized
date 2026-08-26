import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { UioQrCode } from "./qr-code.js";
import { encodeQr, qrPathData } from "./qr-encoder.js";

// The download trigger is the library Button with an icon, and no icon set is
// registered in a unit test — so `Icon` says so, once, loudly, and irrelevantly
// to anything asserted here.
beforeAll(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterAll(() => vi.restoreAllMocks());

/**
 * The half of QRCode the parity gate cannot see.
 *
 * The gate compares tags, classes, ARIA and `data-*`, and the code itself is
 * none of those: it is `d` on one `<path>`, sized by custom properties on the
 * root. So the gate proves the scaffolding matches the other three libraries and
 * says nothing about whether the code encodes anything.
 *
 * `qr-encoder.spec.ts` is where the modules are proved correct. What is asserted
 * here is narrower and still worth having: that the props reach the encoder, and
 * that the geometry the component publishes agrees with the modules it drew.
 */
@Component({
  standalone: true,
  imports: [UioQrCode],
  template: `
    <div
      uioQrCode
      [value]="value()"
      [label]="label()"
      [pixelSize]="pixelSize()"
      [errorCorrection]="errorCorrection()"
      [showDownload]="showDownload()"
      [size]="size()"
    ></div>
  `,
})
class Host {
  /**
   * Writable signals rather than `input()`s: these fixtures are JIT-compiled and
   * JIT does not register initializer-based inputs. See `part.spec.ts`.
   */
  readonly value = signal("https://ui-organized.dev");
  readonly label = signal<string | undefined>(undefined);
  readonly pixelSize = signal(10);
  readonly errorCorrection = signal<"L" | "M" | "Q" | "H" | undefined>(undefined);
  readonly showDownload = signal(false);
  readonly size = signal<"sm" | "md" | "lg">("md");
}

describe("UioQrCode", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const mount = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-part="root"]') as HTMLElement;
    const pattern = () => fixture.nativeElement.querySelector('[data-part="pattern"]') as Element;
    return { fixture, root, pattern };
  };

  /**
   * Everything below runs on the component's *default* inputs, and that is not
   * a shortcut — it is the only thing a spec in this package can do.
   *
   * `part.spec.ts` states the rule: JIT does not register initializer-based
   * inputs, so `input()` is read for its default and never bound. The host
   * template above binds `[value]`, `[pixelSize]` and the rest, and under JIT
   * none of them arrive — the component encodes `""` at pixel size 10 no matter
   * what the host sets. Tests that set a host signal and expect the pattern to
   * change were asserting the default against itself.
   *
   * So input-driven behaviour — a different value producing a different code,
   * pixelSize scaling the modules, errorCorrection reaching the encoder, the
   * download trigger appearing — belongs to the parity harness, which runs the
   * ahead-of-time build the way a consumer does and where the inputs are real.
   * The encoder's own correctness is `qr-encoder.spec.ts`, 43 fixtures deep.
   *
   * What is left here is the seam between the two: that the component renders
   * the modules the encoder actually produced, rather than a stale or empty
   * path.
   */
  it("renders a path built from real modules", () => {
    const { pattern } = mount();
    // A module is `M<x>,<y>h<n>v<n>h-<n>z`; an empty or absent `d` means the
    // value never reached the encoder.
    expect(pattern().getAttribute("d")).toMatch(/^M\d+,\d+h/);
  });

  it("draws exactly the modules the encoder produced", () => {
    // The one assertion tying the rendered path back to the encoder that
    // `qr-encoder.spec.ts` pins: a component that encoded correctly and then
    // rendered a stale path would pass the test above.
    //
    // Encoded from `""` at pixel size 10, which is what the component's own
    // defaults are — see the note above for why the host's bindings do not
    // reach it here.
    const { pattern } = mount();
    const expected = qrPathData(encodeQr("", { ecc: "L" }), 10);
    expect(pattern().getAttribute("d")).toBe(expected);
  });

  it("publishes geometry that agrees with the path it drew", () => {
    const { root, pattern } = mount();
    const modules = encodeQr("", { ecc: "L" }).size;
    // The root advertises the code's pixel extent through custom properties, and
    // a mismatch between those and the drawn path is how a QR code ends up
    // clipped in a layout that trusted the number.
    const style = root.getAttribute("style") ?? "";
    expect(style).toContain("--qrcode-pixel-size: 10px");
    expect(style).toContain(`--qrcode-width: ${modules * 10}px`);
    expect(pattern().getAttribute("d")).toBe(qrPathData(encodeQr("", { ecc: "L" }), 10));
  });
});
