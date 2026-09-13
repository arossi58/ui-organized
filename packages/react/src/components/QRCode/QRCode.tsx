import { QrCode as ArkQrCode } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { qrCodeStyles } from "@ui-organized/core";
import type { QRCodeProps } from "./QRCode.types.js";
import "@ui-organized/core/components/QRCode/QRCode.css";

const DEFAULT_PIXEL_SIZE = 10;

/**
 * A scannable code for a string.
 *
 * Exported as `QRCode`; Ark's namespace is `QrCode`. The library's casing wins
 * for the public name — the initialism is capitalised everywhere else here.
 */
export function QRCode({
  value,
  label,
  pixelSize = DEFAULT_PIXEL_SIZE,
  errorCorrection,
  overlay,
  showDownload = false,
  downloadLabel = "Download",
  downloadFileName = "qr-code",
  size = "md",
  variant,
  className,
}: QRCodeProps) {
  return (
    <ArkQrCode.Root
      className={clsx(qrCodeStyles({ size, variant }), className)}
      value={value}
      pixelSize={pixelSize}
      encoding={errorCorrection ? { ecc: errorCorrection } : undefined}
    >
      {/* The name lives on the Frame, not the Root.
          `aria-label` on a div with no role is prohibited — ARIA ignores it, so
          the code announced as nothing at all — and `role="img"` is what makes
          it legal. But it has to go on the element that *is* the image: the Root
          also holds the download button, and an `img` may not contain a
          control. The Frame is the code itself and owns neither problem. */}
      <ArkQrCode.Frame className="qr-code__frame" role="img" aria-label={label ?? value}>
        <ArkQrCode.Pattern className="qr-code__pattern" />
      </ArkQrCode.Frame>
      {overlay && <ArkQrCode.Overlay className="qr-code__overlay">{overlay}</ArkQrCode.Overlay>}
      {showDownload && (
        <ArkQrCode.DownloadTrigger
          mimeType="image/png"
          fileName={`${downloadFileName}.png`}
          asChild
        >
          <Button intent="secondary" size={size} type="button" icon="download">
            {downloadLabel}
          </Button>
        </ArkQrCode.DownloadTrigger>
      )}
    </ArkQrCode.Root>
  );
}
