import type { ComponentType } from "react";
import { Attachment as RAttachment } from "@ui-organized/react";
import AttachmentFixture from "../fixtures/AttachmentFixture.svelte";
import VueAttachmentFixture from "../fixtures/vue/AttachmentFixture.vue";
import type { ParitySpec } from "./spec.js";

const noop = () => {};

const spec: ParitySpec = {
  component: "Attachment",
  // `removable` / `retryable` stand for the handlers, which JSON props cannot
  // carry to the browser gate. Angular's own API is those two inputs.
  react: ({ removable, retryable, ...p }) => (
    <RAttachment {...(p as any)} onRemove={removable ? noop : undefined} onRetry={retryable ? noop : undefined} />
  ),
  svelte: AttachmentFixture as unknown as ComponentType<any>,
  vue: VueAttachmentFixture as unknown as ComponentType<any>,
  cases: [
    { name: "done", props: { name: "report.pdf", size: 48210 } },
    { name: "removable", props: { name: "report.pdf", size: 48210, removable: true } },
    { name: "uploading", props: { name: "clip.mov", status: "uploading", progress: 45, removable: true } },
    { name: "uploading, no progress yet", props: { name: "clip.mov", status: "uploading" } },
    // The retry shows only on a failure; the remove stays.
    { name: "error with retry", props: { name: "clip.mov", status: "error", error: "Network lost", retryable: true, removable: true } },
    { name: "error, default message", props: { name: "clip.mov", status: "error" } },
    { name: "link", props: { name: "report.pdf", size: 48210, href: "/files/report.pdf" } },
    { name: "chip", props: { name: "report.pdf", size: 48210, variant: "chip", removable: true } },
    { name: "chip uploading", props: { name: "clip.mov", variant: "chip", status: "uploading", progress: 10 } },
    { name: "labels", props: { name: "a.txt", status: "error", retryable: true, removable: true, retryLabel: "Try again", removeLabel: "Discard" } },
  ],
};

export default spec;
