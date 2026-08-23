import type { ComponentType } from "react";
import { FileUpload as RFileUpload } from "@ui-organized/react";
import FileUploadFixture from "../fixtures/FileUploadFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const VARIANTS = ["dropzone", "button", "compact"] as const;

const spec: ParitySpec = {
  component: "FileUpload",
  react: (p) => <RFileUpload {...p} />,
  svelte: FileUploadFixture as unknown as ComponentType<any>,
  cases: [
    // The chosen-file list is machine state built from real `File` objects,
    // which a static render has none of — so every case here renders the empty
    // list, and the populated rows belong to the browser harness.
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
    { name: "max files", props: { maxFiles: 3 } },
    { name: "max file size", props: { maxFileSize: 1024 } },
    { name: "min file size", props: { minFileSize: 16 } },
    { name: "no drop", props: { allowDrop: false } },
    { name: "directory", props: { directory: true } },
    { name: "no preview", props: { showPreview: false } },
    { name: "disabled", props: { label: "Files", disabled: true } },
    { name: "named", props: { name: "files", label: "Files" } },
  ],
};

export default spec;
