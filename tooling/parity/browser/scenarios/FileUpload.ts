import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The dropzone, the trigger and the empty list.
 *
 * Every case here is static, and that is a limit of the harness rather than a
 * choice: a populated file row needs real `File` objects, which arrive only
 * through `setInputFiles` or a synthesised drop — neither of which a scenario's
 * JSON props can express, and neither of which the shared step vocabulary has.
 * The rows themselves are asserted in `file-upload.spec.ts`, where a `File` can
 * simply be constructed.
 *
 * The SSR gate covers these for the other three; Angular is compared in the
 * browser only, so they are repeated here.
 */
const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["dropzone", "button", "compact"] as const;

const scenarios: BrowserScenario[] = staticScenarios("FileUpload", [
  { name: "default" },
  { name: "with label", props: { label: "Attachments" } },
  { name: "required", props: { label: "Attachments", required: true } },
  { name: "helper text", props: { label: "Attachments", helperText: "PDF or PNG" } },
  { name: "error message", props: { label: "Attachments", error: "Too large" } },
  { name: "invalid without message", props: { label: "Attachments", error: true } },
  { name: "helper hidden by error", props: { label: "A", helperText: "H", error: "Bad" } },
  ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Files" } })),
  // `button` drops the dropzone entirely and leaves the trigger alone, so the
  // two branches of the layout are both pinned.
  ...VARIANTS.map((variant) => ({ name: `variant/${variant}`, props: { variant } })),
  { name: "variant/button with label", props: { variant: "button", label: "Files" } },
  { name: "dropzone label", props: { dropzoneLabel: "Drop them here" } },
  { name: "trigger label", props: { triggerLabel: "Browse" } },
  { name: "accept string", props: { accept: "image/*" } },
  { name: "accept list", props: { accept: ["image/png", ".pdf"] } },
  /** `maxFiles > 1` is what puts `multiple` on the hidden input. */
  { name: "max files", props: { maxFiles: 3 } },
  { name: "max file size", props: { maxFileSize: 1024 } },
  { name: "min file size", props: { minFileSize: 16 } },
  { name: "no drop", props: { allowDrop: false } },
  { name: "directory", props: { directory: true } },
  { name: "no preview", props: { showPreview: false } },
  /** Disabled reaches the root, the label, the dropzone, the trigger and the list. */
  { name: "disabled", props: { label: "Files", disabled: true } },
  { name: "named", props: { name: "files", label: "Files" } },
]);

export default scenarios;
