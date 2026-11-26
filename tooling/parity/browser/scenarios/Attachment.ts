import { staticScenarios, type BrowserScenario } from "./scenario.js";

/** The same cases as the SSR gate's; see cases/Attachment.tsx for `removable` / `retryable`. */
const scenarios: BrowserScenario[] = staticScenarios("Attachment", [
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
]);

export default scenarios;
