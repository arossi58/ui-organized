import type { ComponentType } from "react";
import { Button as RButton, Input as RInput } from "@ui-organized/react";
import InputFixture from "../fixtures/InputFixture.svelte";
import VueInputFixture from "../fixtures/vue/InputFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Input",
  // `withButton` stands for the slot add-on each library fills its own way.
  react: ({ withButton, ...p }) => (
    <RInput {...p} endAddon={withButton ? <RButton intent="secondary">Copy</RButton> : p.endAddon} />
  ),
  svelte: InputFixture as unknown as ComponentType<any>,
  vue: VueInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Email" } },
    { name: "required", props: { label: "Email", required: true } },
    { name: "helper text", props: { label: "Email", helperText: "We never share it" } },
    // The error path replaces the helper text and drives [data-invalid]
    // through every part of the field.
    { name: "error message", props: { label: "Email", error: "Required" } },
    { name: "invalid without message", props: { label: "Email", error: true } },
    { name: "helper hidden by error", props: { label: "E", helperText: "H", error: "Bad" } },
    ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "disabled", props: { label: "Email", disabled: true } },
    { name: "placeholder", props: { placeholder: "you@example.com" } },
    { name: "type=email", props: { type: "email" } },
    { name: "start icon", props: { label: "Search", startIcon: "check" } },
    { name: "end icon", props: { label: "Search", endIcon: "check" } },
    { name: "start addon", props: { label: "Website", startAddon: "https://" } },
    { name: "end addon", props: { label: "Website", endAddon: ".com" } },
    { name: "both addons", props: { label: "Website", startAddon: "https://", endAddon: ".com" } },
    { name: "addons sm", props: { label: "Website", startAddon: "https://", size: "sm" } },
    { name: "addon + icon", props: { label: "Amount", startAddon: "USD", startIcon: "check" } },
    { name: "button addon", props: { label: "Share link", withButton: true } },
    { name: "addon invalid", props: { label: "Website", startAddon: "https://", error: true } },
    { name: "addon disabled", props: { label: "Website", endAddon: ".com", disabled: true } },
    // Text add-ons join aria-describedby ahead of the helper text.
    { name: "addons + helper", props: { label: "Website", startAddon: "https://", endAddon: ".com", helperText: "Your site" } },
  ],
};

export default spec;
