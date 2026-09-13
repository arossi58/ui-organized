import type { ComponentType } from "react";
import { Clipboard as RClipboard } from "@ui-organized/react";
import ClipboardFixture from "../fixtures/ClipboardFixture.svelte";
import VueClipboardFixture from "../fixtures/vue/ClipboardFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const value = "https://ui-organized.dev";

const spec: ParitySpec = {
  component: "Clipboard",
  react: (p) => <RClipboard {...(p as any)} />,
  svelte: ClipboardFixture as unknown as ComponentType<any>,
  vue: VueClipboardFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { value } },
    { name: "with label", props: { value, label: "Share link" } },
    { name: "helper text", props: { value, helperText: "Anyone with the link" } },
    // The button variant drops the value box; the trigger is the whole control.
    { name: "variant/button", props: { value, variant: "button" } },
    { name: "variant/input", props: { value, variant: "input" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { value, size } })),
    { name: "custom labels", props: { value, copyLabel: "Copy URL", copiedLabel: "Done" } },
    { name: "timeout", props: { value, timeout: 500 } },
    { name: "extra class", props: { value, className: "custom" } },
  ],
};

export default spec;
