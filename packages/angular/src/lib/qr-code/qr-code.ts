import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  DOCUMENT,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from "@angular/core";
import { qrCodeStyles, type QRCodeVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { encodeQr, qrPathData, type QrErrorCorrection } from "./qr-encoder.js";

export type QRCodeSize = NonNullable<QRCodeVariants["size"]>;
export type QRCodeVariant = NonNullable<QRCodeVariants["variant"]>;

const DEFAULT_PIXEL_SIZE = 10;

/**
 * A scannable code for a string.
 *
 * ```html
 * <div uioQrCode value="https://ui-organized.dev" [showDownload]="true"></div>
 * ```
 *
 * ── The encoder is this package's own, and that is the whole story here ─────
 *
 * React, Svelte and Vue get their modules from `@zag-js/qr-code`, which bundles
 * `uqr`. Angular has no zag and takes no dependency beyond the CDK, so the
 * encoder is written out in `qr-encoder.ts` — including Reed-Solomon, automatic
 * mask selection and every function pattern. It is held to `uqr`'s output module
 * for module in `qr-encoder.spec.ts`, because a QR code that is merely *valid*
 * is not good enough: four libraries rendering four different valid codes for
 * the same string would be a worse failure than an unstyled one, and a silent
 * one.
 *
 * ── Which default the level actually is ─────────────────────────────────────
 *
 * `errorCorrection` is documented as defaulting to 'M' and does not: the other
 * three pass `encoding: undefined` when the prop is absent, and `uqr`'s own
 * default is 'L'. That is reproduced rather than corrected — the four libraries
 * have to render the same code — so the input's default is left undefined and
 * the encoder falls back to 'L'.
 *
 * ── The overlay is a template, not projected content ────────────────────────
 *
 * React takes a node, Svelte a snippet, Vue a slot. Angular's `<ng-content>`
 * cannot answer "did the caller give me anything?", and an always-rendered
 * overlay wrapper would put a bordered white box over the middle of every code.
 * A `TemplateRef` is the Angular way to hand a component markup it renders
 * itself, and its absence is a real answer. Same shape as `SplitterPanelDef`.
 */
@Component({
  selector: "div[uioQrCode]",
  standalone: true,
  exportAs: "uioQrCode",
  imports: [NgTemplateOutlet, UioButton],
  template: `
    <!--
      The name lives on the frame, not the host. "aria-label" on an element with
      no role is prohibited — ARIA ignores it, so the code is announced as
      nothing at all — and the img role is what makes it legal. But it has to go
      on the element that *is* the image: the host also holds the download
      button, and an "img" may not contain a control. Same placement as the
      other three libraries.
    -->
    <svg
      data-scope="qr-code"
      data-part="frame"
      class="qr-code__frame"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      [id]="partId('frame')"
      [attr.aria-label]="label() ?? value()"
      [attr.viewBox]="viewBox()"
    >
      <path data-scope="qr-code" data-part="pattern" class="qr-code__pattern" [attr.d]="path()" />
    </svg>
    @if (overlay(); as template) {
      <!--
        No id, matching Ark React. zag 1.43.3 gives this part one so that its
        getDataUrl can composite the logo into the exported PNG, and the older
        machine React bundles does not — see the allowance in the parity case.
        The download below rasterises the frame alone in every library.
      -->
      <div
        data-scope="qr-code"
        data-part="overlay"
        class="qr-code__overlay"
        [attr.style]="OVERLAY_STYLE"
      >
        <ng-container [ngTemplateOutlet]="template" />
      </div>
    }
    @if (showDownload()) {
      <button
        uioButton
        intent="secondary"
        type="button"
        icon="download"
        data-scope="qr-code"
        data-part="download-trigger"
        [size]="size()"
        (click)="download()"
      >
        {{ downloadLabel() }}
      </button>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.style]": "rootStyle()",
  },
})
export class UioQrCode extends UioPart {
  readonly scope = "qr-code";
  readonly part = "root";

  /** The string encoded into the code — a URL, an id, anything scannable. */
  readonly value = input("");
  /** Accessible label for the code. Defaults to the encoded value. */
  readonly label = input<string | undefined>(undefined);
  /**
   * Edge length of one module in pixels. A fractional module produces visible
   * moiré and can make the code unreadable, so it is rounded rather than
   * trusted.
   */
  readonly pixelSize = input(DEFAULT_PIXEL_SIZE, { transform: numberAttribute });
  /** Higher levels survive more damage, at the cost of a denser code. */
  readonly errorCorrection = input<QrErrorCorrection | undefined>(undefined);
  /** A logo or badge drawn over the centre. Only safe at high error correction. */
  readonly overlay = input<TemplateRef<unknown> | undefined>(undefined);
  readonly showDownload = input(false, { transform: booleanAttribute });
  readonly downloadLabel = input("Download");
  /** File name for the download, without an extension. */
  readonly downloadFileName = input("qr-code");
  readonly size = input<QRCodeSize>("md");
  readonly variant = input<QRCodeVariant>("default");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  /**
   * Ark spells this machine's ids `qrcode:<machine>:<part>` — one word, where
   * the scope attribute is hyphenated. Reproduced rather than tidied: two DOM
   * trees are easier to read side by side when the literals have the same shape.
   */
  private readonly machine = nextMachineId();
  protected readonly rootId = `qrcode:${this.machine}:root`;
  protected partId(part: string): string {
    return `qrcode:${this.machine}:${part}`;
  }

  protected readonly hostClass = computed(() =>
    qrCodeStyles({ size: this.size(), variant: this.variant() }),
  );

  /** Ark's inline style on the overlay, reproduced so the logo centres itself. */
  protected readonly OVERLAY_STYLE =
    "position: absolute; top: 50%; left: 50%; translate: -50% -50%;";

  private readonly modules = computed(() =>
    encodeQr(this.value(), { ecc: this.errorCorrection() ?? "L" }),
  );
  private readonly moduleSize = computed(() => Math.max(1, Math.round(this.pixelSize())));
  private readonly extent = computed(() => this.modules().size * this.moduleSize());

  protected readonly path = computed(() => qrPathData(this.modules(), this.moduleSize()));
  protected readonly viewBox = computed(() => `0 0 ${this.extent()} ${this.extent()}`);

  /**
   * The geometry the machine publishes to CSS, and `position: relative` so the
   * overlay has something to centre against.
   *
   * `QRCode.css` reads none of these — it sizes the frame from its own
   * `--qr-size` — but they are part of what the component publishes in the other
   * three libraries, and a consumer positioning something over the code has
   * nothing else to measure from.
   */
  protected readonly rootStyle = computed(
    () =>
      `--qrcode-pixel-size: ${this.moduleSize()}px; --qrcode-width: ${this.extent()}px; ` +
      `--qrcode-height: ${this.extent()}px; position: relative;`,
  );

  /**
   * Rasterise the frame and hand it to the browser as a download.
   *
   * The SVG is serialised, drawn into a canvas at device-pixel resolution and
   * exported as a PNG — the same route `@zag-js/dom-query`'s `getDataUrl` takes,
   * including the white fill, without which a PNG of a code whose ink is a theme
   * token comes out as dark-on-transparent and renders black-on-black wherever
   * it is pasted.
   *
   * Everything after `image.onload` is one frame later, which is why this is not
   * a signal: there is no rendered state to hold, only a side effect.
   */
  download(): void {
    const frame = this.host.nativeElement.querySelector("svg");
    if (!frame) return;
    const box = frame.getBoundingClientRect();
    const source = new XMLSerializer().serializeToString(frame);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

    const ratio = this.document.defaultView?.devicePixelRatio || 1;
    const canvas = this.document.createElement("canvas");
    canvas.width = Math.max(1, box.width * ratio);
    canvas.height = Math.max(1, box.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.onload = () => {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const anchor = this.document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.rel = "noopener";
      anchor.download = `${this.downloadFileName()}.png`;
      anchor.click();
      anchor.remove();
    };
    image.src = svgUrl;
  }
}
