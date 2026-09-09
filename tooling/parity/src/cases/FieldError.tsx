import type { ComponentType } from "react";
import { FieldError as RFieldError } from "@ui-organized/react";
import FieldErrorFixture from "../fixtures/FieldErrorFixture.svelte";
import VueFieldErrorFixture from "../fixtures/vue/FieldErrorFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "FieldError",
  // React takes the message as children; Svelte takes it as `message`,
  // because a snippet is opaque and cannot be tested for emptiness.
  react: ({ message, ...p }) => <RFieldError {...p}>{message}</RFieldError>,
  svelte: FieldErrorFixture as unknown as ComponentType<any>,
  vue: VueFieldErrorFixture as unknown as ComponentType<any>,
  cases: [
    { name: "with message", props: { message: "Required" } },
    { name: "empty renders nothing", props: { message: "" } },
  ],
};

export default spec;
