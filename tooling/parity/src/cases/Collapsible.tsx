import type { ComponentType } from "react";
import {
  Collapsible as RCollapsible,
  CollapsibleTrigger as RCollapsibleTrigger,
  CollapsibleContent as RCollapsibleContent,
} from "@ui-organized/react";
import CollapsibleFixture from "../fixtures/CollapsibleFixture.svelte";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Collapsible",
  // `triggerLabel`/`body` are the fixture's own props, not the root's — the
  // compound has to be assembled on both sides before anything can be compared.
  react: ({ triggerLabel = "Details", body = "Panel body", ...p }) => (
    <RCollapsible {...p}>
      <RCollapsibleTrigger>{triggerLabel}</RCollapsibleTrigger>
      <RCollapsibleContent>{body}</RCollapsibleContent>
    </RCollapsible>
  ),
  svelte: CollapsibleFixture as unknown as ComponentType<any>,
  cases: [
    // Closed is the interesting one: the panel is still rendered, and it is
    // `hidden` + `data-state="closed"` that keeps it out of the page.
    { name: "default" },
    { name: "open by default", props: { defaultOpen: true } },
    { name: "controlled open", props: { open: true } },
    { name: "controlled closed", props: { open: false } },
    { name: "disabled", props: { disabled: true } },
    { name: "extra class", props: { className: "custom" } },
  ],
};

export default spec;
