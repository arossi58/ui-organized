import type { ComponentType } from "react";
import {
  Field as RField,
  FieldLabel as RFieldLabel,
  FieldControl as RFieldControl,
  FieldDescription as RFieldDescription,
  FieldErrorMessage as RFieldErrorMessage,
} from "@ui-organized/react";
import FieldFixture from "../fixtures/FieldFixture.svelte";
import VueFieldFixture from "../fixtures/vue/FieldFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Field",
  react: ({ errorMessage, ...p }) => (
    <RField {...p}>
      <RFieldLabel>Email</RFieldLabel>
      <RFieldControl />
      <RFieldDescription>Helper</RFieldDescription>
      {errorMessage ? <RFieldErrorMessage>{errorMessage}</RFieldErrorMessage> : null}
    </RField>
  ),
  svelte: FieldFixture as unknown as ComponentType<any>,
  vue: VueFieldFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "stacked", props: { layout: "stacked" } },
    { name: "inline", props: { layout: "inline" } },
    // Validity flows to every part through aria-describedby and [data-invalid],
    // which is the whole reason the parts go through Ark rather than plain tags.
    { name: "invalid", props: { invalid: true } },
    { name: "invalid with message", props: { invalid: true, errorMessage: "Required" } },
    { name: "error hidden when valid", props: { errorMessage: "Required" } },
    { name: "disabled", props: { disabled: true } },
    { name: "required", props: { required: true } },
    { name: "readOnly", props: { readOnly: true } },
  ],
};

export default spec;
