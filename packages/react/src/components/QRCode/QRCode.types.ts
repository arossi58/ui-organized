import type * as React from "react";

export interface QRCodeProps {
  /** The string encoded into the code — a URL, an id, anything scannable. */
  value: string;
  /** Accessible label for the code. Defaults to the encoded value. */
  label?: string;
  /**
   * Edge length of one module (a single square of the code), in pixels.
   * Must be an integer: a fractional module produces visible moiré and can make
   * the code unreadable. Defaults to 10.
   */
  pixelSize?: number;
  /**
   * Error-correction level. Higher levels survive more damage and are what make
   * an `overlay` safe, at the cost of a denser code. Defaults to 'M'.
   */
  errorCorrection?: "L" | "M" | "Q" | "H";
  /**
   * Logo or badge drawn over the centre of the code. Only safe at higher error
   * correction — pair it with `errorCorrection="H"`.
   */
  overlay?: React.ReactNode;
  /** Shows a download button below the code. Defaults to false. */
  showDownload?: boolean;
  /** Text on the download button. Defaults to 'Download'. */
  downloadLabel?: string;
  /** File name for the download, without an extension. Defaults to 'qr-code'. */
  downloadFileName?: string;
  /** Size variant, driving the rendered edge length. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Surface treatment. `framed` puts the code on a bordered card. Defaults to 'default'. */
  variant?: "default" | "framed";
  className?: string;
}
