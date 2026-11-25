---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Attachment, and upload state on FileUpload.

- **Attachment** shows a file as a row or a chip.
  - **Content:** its name and size (formatted, such as 4.2 kB).
  - **While uploading:** a progress bar named for the file.
  - **On failure:** the error, plus a retry button.
  - **`href`** makes the name a download link.
  - **Actions:** remove and retry are `onRemove` and `onRetry` in React, Svelte and Vue (Vue binds `@remove` and `@retry`). In Angular they are `removable` + `(remove)` and `retryable` + `(retry)`, as on Tag.
- **FileUpload** takes `fileStatus(file)`, which returns `{ progress, error }`. The caller does the uploading.
  - While a file uploads, its row shows the progress bar.
  - A failed row shows the error and a retry: `onRetry` in React, Svelte and Vue, or `retryable` + `(retry)` in Angular.
  - Without `fileStatus`, rows render exactly as before.
- **Core** exports `formatFileSize` and `clampProgress`.
