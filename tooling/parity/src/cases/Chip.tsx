import type { ComponentType } from "react";
import { Chip as RChip, ChipSegment as RChipSegment } from "@ui-organized/react";
import ChipFixture from "../fixtures/ChipFixture.svelte";
import VueChipFixture from "../fixtures/vue/ChipFixture.vue";
import type { ParitySpec } from "./spec.js";

const noop = () => {};

const spec: ParitySpec = {
  component: "Chip",
  /**
   * Two flags are translated, not passed, because each stands for handlers —
   * which cannot cross a props object the harness serializes into a URL:
   *
   * - `removable`: React renders the dismiss control from `onRemove`, Svelte
   *   from `onremove`; Vue and Angular take the boolean and emit.
   * - `segmented`: the chip composed from three clickable `ChipSegment`s, the
   *   way a filter chip builds it. Every fixture spells the same three segments,
   *   so what is compared is that each library turns a segment with something
   *   to do into a sibling `<button>` — never a nested one, never a span.
   */
  react: ({ removable, segmented, ...p }) => (
    <RChip {...p} onRemove={removable ? noop : undefined}>
      {segmented ? (
        <>
          <RChipSegment part="label" onClick={noop}>
            Name
          </RChipSegment>
          <RChipSegment part="operator" onClick={noop}>
            is greater than
          </RChipSegment>
          <RChipSegment part="value" onClick={noop}>
            30
          </RChipSegment>
        </>
      ) : null}
    </RChip>
  ),
  svelte: ChipFixture as unknown as ComponentType<any>,
  vue: VueChipFixture as unknown as ComponentType<any>,
  stylesheets: ["Chip/Chip.css"],
  cases: [
    { name: "default", props: { label: "Role" } },
    { name: "sentence", props: { label: "Name", operator: "is greater than", value: "30" } },
    { name: "value only", props: { value: "Admin" } },
    { name: "plain", props: {} },
    // The state that decides which element each segment is. A static token must
    // not be a button, or every chip in a list puts empty stops in the tab order.
    { name: "segmented", props: { segmented: true } },
    { name: "selected", props: { segmented: true, selected: true } },
    {
      name: "incomplete",
      props: { label: "Name", operator: "contains", value: "…", incomplete: true },
    },
    { name: "disabled", props: { label: "Role", value: "Admin", disabled: true } },
    {
      name: "removable",
      props: { label: "Role", value: "Admin", removable: true, removeLabel: "Remove role filter" },
    },
  ],
};

export default spec;
