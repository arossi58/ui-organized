import { FileUpload as ArkFileUpload } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { CONTROL_ICON_SIZE, fileUploadStyles, type ControlSize } from "@ui-organized/core";
import type { FileUploadProps } from "./FileUpload.types.js";
import "@ui-organized/core/components/FileUpload/FileUpload.css";

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
        <ArkFileUpload.Dropzone className="file-upload__dropzone">
          <Icon name="upload" size={iconSize} className="file-upload__dropzone-icon" />
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
            api.acceptedFiles.map((file) => (
              <ArkFileUpload.Item key={file.name} file={file} className="file-upload__item">
                {showPreview && (
                  <ArkFileUpload.ItemPreview
                    type="image/*"
                    className="file-upload__item-preview"
                  >
                    <ArkFileUpload.ItemPreviewImage className="file-upload__item-image" />
                  </ArkFileUpload.ItemPreview>
                )}
                {/* Shown for anything that is not an image — `type` is a filter,
                    and Ark renders only the preview whose filter matches. */}
                <ArkFileUpload.ItemPreview type=".*" className="file-upload__item-preview">
                  <Icon name="file" size={iconSize} />
                </ArkFileUpload.ItemPreview>
                <span className="file-upload__item-meta">
                  <ArkFileUpload.ItemName className="file-upload__item-name" />
                  <ArkFileUpload.ItemSizeText className="file-upload__item-size" />
                </span>
                <ArkFileUpload.ItemDeleteTrigger
                  className="file-upload__item-delete"
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="close" size={DELETE_ICON_SIZE} />
                </ArkFileUpload.ItemDeleteTrigger>
              </ArkFileUpload.Item>
            ))
          }
        </ArkFileUpload.Context>
      </ArkFileUpload.ItemGroup>

      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkFileUpload.HiddenInput />
    </ArkFileUpload.Root>
  );
}
