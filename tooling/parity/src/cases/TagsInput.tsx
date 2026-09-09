import type { ComponentType } from "react";
import { TagsInput as RTagsInput } from "@ui-organized/react";
import TagsInputFixture from "../fixtures/TagsInputFixture.svelte";
import VueTagsInputFixture from "../fixtures/vue/TagsInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const tags = ["design", "system"];

const spec: ParitySpec = {
  component: "TagsInput",
  react: (p) => <RTagsInput {...p} />,
  svelte: TagsInputFixture as unknown as ComponentType<any>,
  vue: VueTagsInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Tags" } },
    { name: "required", props: { label: "Tags", required: true } },
    { name: "helper text", props: { label: "Tags", helperText: "Comma separated" } },
    { name: "error message", props: { label: "Tags", error: "Too many" } },
    { name: "invalid without message", props: { label: "Tags", error: true } },
    { name: "helper hidden by error", props: { label: "T", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Tags" } })),
    { name: "placeholder", props: { placeholder: "Add a tag" } },
    // The chips are read back from the machine, not mapped over the prop, so
    // a tag list that never reached the machine renders as an empty well.
    { name: "default value", props: { defaultValue: tags } },
    { name: "controlled value", props: { value: tags } },
    { name: "single tag", props: { defaultValue: ["one"] } },
    // At `max` the machine stops accepting entries; the attribute that says so
    // sits on the control.
    { name: "at max", props: { defaultValue: tags, max: 2 } },
    { name: "under max", props: { defaultValue: tags, max: 5 } },
    { name: "not editable", props: { defaultValue: tags, editable: false } },
    { name: "delimiter", props: { delimiter: ";" } },
    { name: "add on paste", props: { addOnPaste: true } },
    { name: "disabled", props: { label: "Tags", defaultValue: tags, disabled: true } },
    { name: "read only", props: { label: "Tags", defaultValue: tags, readOnly: true } },
    { name: "named", props: { name: "tags", defaultValue: tags } },
  ],
};

export default spec;
