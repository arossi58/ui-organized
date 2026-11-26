import { clsx } from "clsx";
import { attachmentStyles, clampProgress, formatFileSize } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { glyph } from "../../icons/glyph.js";
import type { AttachmentProps } from "./Attachment.types.js";
import "@ui-organized/core/components/Attachment/Attachment.css";

const ACTION_ICON_SIZE = 16;

/** A file, as a row or a chip: name, size or status, progress, and actions. */
export function Attachment({
  name,
  size,
  status = "done",
  progress,
  error,
  href,
  variant = "row",
  onRemove,
  removeLabel,
  onRetry,
  retryLabel,
  progressLabel = "Uploading",
  className,
  ...props
}: AttachmentProps) {
  const pct = clampProgress(progress);
  const meta =
    status === "uploading"
      ? pct != null
        ? `${progressLabel} ${pct}%`
        : progressLabel
      : status === "error"
        ? (error ?? "Upload failed")
        : size != null
          ? formatFileSize(size)
          : null;
  const retry = status === "error" && onRetry;

  return (
    <div className={clsx(attachmentStyles({ variant }), className)} data-status={status} {...props}>
      <span className="attachment__icon" aria-hidden="true">
        <Icon name={glyph(status === "error" ? "alert-circle" : "file")} size={variant === "chip" ? 16 : 20} />
      </span>
      <span className="attachment__body">
        {href ? (
          <a className="attachment__name" href={href} download>
            {name}
          </a>
        ) : (
          <span className="attachment__name">{name}</span>
        )}
        {meta && <span className="attachment__meta">{meta}</span>}
        {status === "uploading" && variant === "row" && (
          <div
            className="attachment__progress"
            role="progressbar"
            aria-label={`${progressLabel} ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct ?? undefined}
          >
            <span className="attachment__progress-bar" style={{ width: `${pct ?? 0}%` }} />
          </div>
        )}
      </span>
      {(retry || onRemove) && (
        <span className="attachment__actions">
          {retry && (
            <button type="button" className="attachment__action" aria-label={retryLabel ?? `Retry ${name}`} onClick={onRetry}>
              <Icon name={glyph("refresh")} size={ACTION_ICON_SIZE} />
            </button>
          )}
          {onRemove && (
            <button type="button" className="attachment__action" aria-label={removeLabel ?? `Remove ${name}`} onClick={onRemove}>
              <Icon name={glyph("close")} size={ACTION_ICON_SIZE} />
            </button>
          )}
        </span>
      )}
    </div>
  );
}
