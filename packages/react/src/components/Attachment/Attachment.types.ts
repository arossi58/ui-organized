import type * as React from "react";

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The file's name. */
  name: string;
  /** Its size in bytes, shown as 4.2 kB once it is done. */
  size?: number;
  /** `uploading` shows progress, `error` the message and a retry. Defaults to `done`. */
  status?: "uploading" | "done" | "error";
  /** Upload progress, 0 to 100, while `status` is `uploading`. */
  progress?: number;
  /** What went wrong, while `status` is `error`. Defaults to "Upload failed". */
  error?: string;
  /** A link to the file: the name becomes a download link. */
  href?: string;
  /** `row` (the default) for lists; `chip` for a compact token beside a message. */
  variant?: "row" | "chip";
  /** Adds a remove button. */
  onRemove?: () => void;
  /** The remove button's accessible name. Defaults to "Remove {name}". */
  removeLabel?: string;
  /** Adds a retry button while `status` is `error`. */
  onRetry?: () => void;
  /** The retry button's accessible name. Defaults to "Retry {name}". */
  retryLabel?: string;
  /** The word before the percentage while uploading. Defaults to "Uploading". */
  progressLabel?: string;
}
