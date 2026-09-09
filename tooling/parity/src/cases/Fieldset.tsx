import type { ComponentType } from "react";
import {
  Field as RField,
  FieldControl as RFieldControl,
  FieldLabel as RFieldLabel,
  Fieldset as RFieldset,
  FieldsetLegend as RFieldsetLegend,
} from "@ui-organized/react";
import FieldsetFixture from "../fixtures/FieldsetFixture.svelte";
import VueFieldsetFixture from "../fixtures/vue/FieldsetFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * A group of fields under one legend.
 *
 * A real `Field` inside it rather than a bare input, because the grouping is the
 * component: what is worth pinning is that the legend names the fieldset, that
 * both carry the same state attributes, and that the fields below are untouched
 * by either — `<fieldset disabled>` disables its descendants in the *browser*,
 * without writing an attribute on any of them, and a port that "helpfully"
 * propagated `disabled` down would show up here as extra markup.
 */
const spec: ParitySpec = {
  component: "Fieldset",
  react: (p) => (
    <RFieldset {...p}>
      <RFieldsetLegend>Contact</RFieldsetLegend>
      <RField>
        <RFieldLabel>Email</RFieldLabel>
        <RFieldControl />
      </RField>
    </RFieldset>
  ),
  svelte: FieldsetFixture as unknown as ComponentType<any>,
  vue: VueFieldsetFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "disabled", props: { disabled: true } },
    { name: "invalid", props: { invalid: true } },
    { name: "disabled and invalid", props: { disabled: true, invalid: true } },
  ],
};

export default spec;
