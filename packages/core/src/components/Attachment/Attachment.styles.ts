import { cva, type VariantProps } from "class-variance-authority";

/**
 * A file, as a row or a chip: its name and size, and while it uploads a
 * progress bar, or its error and a retry once it fails.
 */
export const attachmentStyles = cva("attachment", {
  variants: {
    variant: {
      row: "attachment--row",
      chip: "attachment--chip",
    },
  },
  defaultVariants: {
    variant: "row",
  },
});

export type AttachmentVariants = VariantProps<typeof attachmentStyles>;

export type AttachmentStatus = "uploading" | "done" | "error";

/** Zag's ladder, and the reason 1500 bytes reads as `1.5 kB` and not `1.46 kB`. */
const BYTE_PREFIXES = ["", "kilo", "mega", "giga", "tera", "peta"];

/**
 * A file size in the shape Zag renders it, so an Attachment reads the same as
 * a FileUpload row in every library.
 *
 * Decimal rather than binary, 1000 to the kilobyte, and three significant
 * figures, which is what turns 1536 into `1.54 kB`. `Intl` supplies the unit
 * name, so the string is localised rather than hand-assembled.
 */
export function formatFileSize(bytes: number, locale = "en-US"): string {
  if (Number.isNaN(bytes)) return "";
  if (bytes === 0) return "0 B";
  let value = Math.abs(bytes);
  let index = 0;
  while (value >= 1000 && index < BYTE_PREFIXES.length - 1) {
    value /= 1000;
    index++;
  }
  const rounded = Number.parseFloat(value.toPrecision(3));
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: `${BYTE_PREFIXES[index]}byte`,
    unitDisplay: "short",
  }).format(bytes < 0 ? -rounded : rounded);
}

/** Progress clamped to 0–100 and rounded, or null when there is none. */
export function clampProgress(progress: number | undefined): number | null {
  if (progress == null || !Number.isFinite(progress)) return null;
  return Math.round(Math.min(100, Math.max(0, progress)));
}
