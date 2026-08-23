import type { ComponentType } from "react";
import { PasswordInput as RPasswordInput } from "@ui-organized/react";
import PasswordInputFixture from "../fixtures/PasswordInputFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "PasswordInput",
  react: (p) => <RPasswordInput {...p} />,
  svelte: PasswordInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Password" } },
    { name: "required", props: { label: "Password", required: true } },
    { name: "helper text", props: { label: "Password", helperText: "8 characters" } },
    { name: "error message", props: { label: "Password", error: "Too short" } },
    { name: "invalid without message", props: { label: "Password", error: true } },
    { name: "helper hidden by error", props: { label: "P", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "P" } })),
    { name: "disabled", props: { label: "Password", disabled: true } },
    // Without the toggle the control loses its trailing padding class too.
    { name: "no toggle", props: { label: "Password", showToggle: false } },
    { name: "placeholder", props: { placeholder: "Your password" } },
    { name: "named", props: { name: "password", label: "Password" } },
  ],
};

export default spec;
