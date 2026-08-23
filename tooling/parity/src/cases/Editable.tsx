import type { ComponentType } from "react";
import { Editable as REditable } from "@ui-organized/react";
import EditableFixture from "../fixtures/EditableFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Editable",
  react: (p) => <REditable {...p} />,
  svelte: EditableFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Name" } },
    { name: "required", props: { label: "Name", required: true } },
    { name: "helper text", props: { label: "Name", helperText: "Click to edit" } },
    { name: "error message", props: { label: "Name", error: "Too short" } },
    { name: "invalid without message", props: { label: "Name", error: true } },
    { name: "helper hidden by error", props: { label: "N", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Name" } })),
    // The preview carries the value as its own text and swaps with the input on
    // edit; both are mounted, and `hidden` is what picks between them.
    { name: "default value", props: { defaultValue: "Ada" } },
    { name: "controlled value", props: { value: "Ada" } },
    // Empty is a state of its own: [data-placeholder-shown] is what colours the
    // preview like a placeholder rather than like a value.
    { name: "placeholder", props: { placeholder: "Add a name" } },
    { name: "placeholder with value", props: { placeholder: "Add a name", defaultValue: "Ada" } },
    { name: "activation/dblclick", props: { activationMode: "dblclick" } },
    { name: "activation/click", props: { activationMode: "click" } },
    { name: "activation/none", props: { activationMode: "none" } },
    { name: "submit/enter", props: { submitMode: "enter" } },
    { name: "submit/both", props: { submitMode: "both" } },
    { name: "auto resize", props: { autoResize: true, defaultValue: "Ada" } },
    { name: "max length", props: { maxLength: 10 } },
    // The three triggers are mounted together and separated by `hidden`, so
    // this is the case that pins the whole control row.
    { name: "show controls", props: { showControls: true, defaultValue: "Ada" } },
    ...SIZES.map((size) => ({
      name: `show controls/${size}`,
      props: { showControls: true, size },
    })),
    { name: "disabled", props: { label: "Name", disabled: true, defaultValue: "Ada" } },
    { name: "read only", props: { label: "Name", readOnly: true, defaultValue: "Ada" } },
    { name: "named", props: { name: "display-name", defaultValue: "Ada" } },
  ],
};

export default spec;
