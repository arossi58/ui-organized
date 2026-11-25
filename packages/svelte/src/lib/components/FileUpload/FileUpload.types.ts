/** What `fileStatus` reports for one file. */
export interface FileUploadStatus {
  /** Upload progress, 0 to 100. Below 100 the row shows a progress bar. */
  progress?: number;
  /** What went wrong. The row shows it, and a retry button when `onRetry` is set. */
  error?: string;
}

export interface FileUploadProps {
  /**
   * The upload state of each listed file, which the component cannot know:
   * the caller does the uploading. Return a `progress` while it runs and an
   * `error` if it fails; return nothing for a file that is done.
   */
  fileStatus?: (file: File) => FileUploadStatus | undefined;
  /** Called from a failed file's retry button. */
  onRetry?: (file: File) => void;
  /** The word before the percentage while uploading. Defaults to "Uploading". */
  progressLabel?: string;
  /** Accessible label rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Accepted types, as MIME types or extensions — `"image/*"`,
   * `["image/png", ".pdf"]`, or a map of MIME type to extensions.
   */
  accept?: string | string[] | Record<string, string[]>;
  /** Maximum number of files. Defaults to 1. */
  maxFiles?: number;
  /** Largest accepted file, in bytes. */
  maxFileSize?: number;
  /** Smallest accepted file, in bytes. */
  minFileSize?: number;
  /** Controlled list of accepted files. Bindable: `bind:acceptedFiles`. */
  acceptedFiles?: File[];
  /** Initial files for the uncontrolled case. */
  defaultAcceptedFiles?: File[];
  /** Called with the accepted and rejected lists whenever either changes. */
  onFileChange?: (details: { acceptedFiles: File[]; rejectedFiles: unknown[] }) => void;
  /** Called with the files that failed validation. */
  onFileReject?: (files: unknown[]) => void;
  /** Accepts files dropped onto the dropzone. Defaults to true. */
  allowDrop?: boolean;
  /** Lets the picker select a whole directory. Defaults to false. */
  directory?: boolean;
  /** Text inside the dropzone. */
  dropzoneLabel?: string;
  /** Text on the browse button. Defaults to 'Choose files'. */
  triggerLabel?: string;
  /**
   * Layout. `dropzone` is the full drop target, `button` is the trigger alone,
   * `compact` is a single row. Defaults to 'dropzone'.
   */
  variant?: "dropzone" | "button" | "compact";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Shows a thumbnail for image files. Defaults to true. */
  showPreview?: boolean;
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
  class?: string;
}
