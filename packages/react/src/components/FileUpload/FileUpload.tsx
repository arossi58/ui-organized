import { FileUpload as ArkFileUpload } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { OMIT_ARIA } from "@ui-organized/core";
import { FieldError } from "../FieldError/index.js";
import { CONTROL_ICON_SIZE, clampProgress, fileUploadStyles, type ControlSize } from "@ui-organized/core";
import type { FileUploadProps } from "./FileUpload.types.js";
import "@ui-organized/core/components/FileUpload/FileUpload.css";
import { glyph } from "../../icons/glyph.js";

/** Delete affordance inside a file row — always the small edge, because it sits
 *  inside the row rather than beside it. */
const DELETE_ICON_SIZE = 16;

export function FileUpload({
  label,
  helperText,
  error,
  accept,
  maxFiles,
  maxFileSize,
  minFileSize,
  acceptedFiles,
  defaultAcceptedFiles,
  onFileChange,
  onFileReject,
  allowDrop,
  directory,
  dropzoneLabel = "Drag files here, or",
  triggerLabel = "Choose files",
  variant = "dropzone",
  size = "md",
  showPreview = true,
  required,
  disabled,
  name,
  fileStatus,
  onRetry,
  progressLabel = "Uploading",
  className,
}: FileUploadProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];

  const trigger = (
    <ArkFileUpload.Trigger asChild>
      <Button intent="secondary" size={size} type="button">
        {triggerLabel}
      </Button>
    </ArkFileUpload.Trigger>
  );

  return (
    <ArkFileUpload.Root
      className={clsx(fileUploadStyles({ size, variant }), className)}
      accept={accept}
      maxFiles={maxFiles}
      maxFileSize={maxFileSize}
      minFileSize={minFileSize}
      acceptedFiles={acceptedFiles}
      defaultAcceptedFiles={defaultAcceptedFiles}
      onFileChange={
        onFileChange &&
        ((details) =>
          onFileChange({
            acceptedFiles: details.acceptedFiles,
            rejectedFiles: details.rejectedFiles,
          }))
      }
      onFileReject={onFileReject && ((details) => onFileReject(details.files))}
      allowDrop={allowDrop}
      directory={directory}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      name={name}
    >
      {label && (
        <ArkFileUpload.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkFileUpload.Label>
      )}

      {variant === "button" ? (
        trigger
      ) : (
        <ArkFileUpload.Dropzone
          className="file-upload__dropzone"
          // Ark makes the dropzone a focusable `role="button"`, and we put the
          // real "Choose files" button inside it — two nested controls, so a
          // screen reader cannot say which one focus is on, and a keyboard user
          // hits an unnamed outer button before the named inner one.
          //
          // The drop area keeps working: dropping is a pointer gesture, and the
          // button inside is the keyboard and click path. What goes is only the
          // claim that the div is itself a control.
          role={OMIT_ARIA}
          tabIndex={OMIT_ARIA as unknown as number}
          aria-label={OMIT_ARIA}
        >
          <Icon name={glyph("upload")} size={iconSize} className="file-upload__dropzone-icon" />
          <span className="file-upload__dropzone-text">{dropzoneLabel}</span>
          {trigger}
        </ArkFileUpload.Dropzone>
      )}

      {/* The file list is machine state, so it is read back from context rather
          than mapped over the `acceptedFiles` prop — that keeps the uncontrolled
          case working without the caller holding the list. */}
      <ArkFileUpload.ItemGroup className="file-upload__items">
        <ArkFileUpload.Context>
          {(api) =>
            api.acceptedFiles.map((file) => {
              // The caller does the uploading, so the state is theirs to report.
              const reported = fileStatus?.(file);
              const pct = clampProgress(reported?.progress);
              const status = reported?.error
                ? "error"
                : pct != null && pct < 100
                  ? "uploading"
                  : undefined;
              return (
                <ArkFileUpload.Item key={file.name} file={file} className="file-upload__item" data-status={status}>
                  {showPreview && (
                    <ArkFileUpload.ItemPreview type="image/*" className="file-upload__item-preview">
                      <ArkFileUpload.ItemPreviewImage className="file-upload__item-image" />
                    </ArkFileUpload.ItemPreview>
                  )}
                  {/* Shown for anything that is not an image — `type` is a filter,
                      and Ark renders only the preview whose filter matches. */}
                  <ArkFileUpload.ItemPreview type=".*" className="file-upload__item-preview">
                    <Icon name={glyph("file")} size={iconSize} />
                  </ArkFileUpload.ItemPreview>
                  <span className="file-upload__item-meta">
                    <ArkFileUpload.ItemName className="file-upload__item-name" />
                    {status === "uploading" ? (
                      <span className="file-upload__item-status">{`${progressLabel} ${pct}%`}</span>
                    ) : status === "error" ? (
                      <span className="file-upload__item-status">{reported?.error}</span>
                    ) : (
                      <ArkFileUpload.ItemSizeText className="file-upload__item-size" />
                    )}
                    {status === "uploading" && (
                      <div
                        className="file-upload__item-progress"
                        role="progressbar"
                        aria-label={`${progressLabel} ${file.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct ?? undefined}
                      >
                        <span className="file-upload__item-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </span>
                  {status === "error" && onRetry && (
                    <button
                      type="button"
                      className="file-upload__item-retry"
                      aria-label={`Retry ${file.name}`}
                      onClick={() => onRetry(file)}
                    >
                      <Icon name={glyph("refresh")} size={DELETE_ICON_SIZE} />
                    </button>
                  )}
                  <ArkFileUpload.ItemDeleteTrigger
                    className="file-upload__item-delete"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Icon name={glyph("close")} size={DELETE_ICON_SIZE} />
                  </ArkFileUpload.ItemDeleteTrigger>
                </ArkFileUpload.Item>
              );
            })
          }
        </ArkFileUpload.Context>
      </ArkFileUpload.ItemGroup>

      {helperText && !isInvalid && <span className="field__description">{helperText}</span>}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkFileUpload.HiddenInput />
    </ArkFileUpload.Root>
  );
}
