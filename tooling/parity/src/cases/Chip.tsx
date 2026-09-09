import type { ComponentType } from "react";
import { Chip as RChip } from "@ui-organized/react";
import ChipFixture from "../fixtures/ChipFixture.svelte";
import VueChipFixture from "../fixtures/vue/ChipFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Chip",
  /**
   * `removable` is translated, not passed. React decides to render the dismiss
   * control from `onRemove` — a *handler*, which cannot cross a props object the
   * harness serializes into a URL — while the three ports expose the same
   * decision as a boolean. Without the bridge the browser scenario compares a
   * React chip that has no remove button against three that do, and reports a
   * divergence the libraries do not actually have.
   *
   * The button it renders is a sibling of the body, never nested: a button
   * inside a button is invalid HTML and an axe `nested-interactive` violation.
   * That is a claim about tree shape, and worth four libraries agreeing on it.
   */
  react: ({ removable, ...p }) => (
    <RChip {...p} onRemove={removable ? () => {} : undefined}>
      Admin
    </RChip>
  ),
  svelte: ChipFixture as unknown as ComponentType<any>,
  vue: VueChipFixture as unknown as ComponentType<any>,
  stylesheets: ["Chip/Chip.css"],
  cases: [
    { name: "default", props: { label: "Role" } },
    { name: "sentence", props: { label: "Role", detail: "is any of" } },
    { name: "plain", props: {} },
    ...(["outline", "subtle"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant, label: "Role" },
    })),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Role" } })),
    // The state that decides which element the body is. A static token must not
    // be a button, or every chip in a list becomes an empty stop in the tab
    // order — and only rendering all four proves the three ports agree on it.
    { name: "dropdown", props: { label: "Role", dropdown: true } },
    { name: "selected", props: { label: "Role", selected: true, dropdown: true } },
    { name: "incomplete", props: { label: "Role", incomplete: true, dropdown: true } },
    { name: "disabled", props: { label: "Role", disabled: true } },
    { name: "icon", props: { label: "Owner", icon: "user" } },
    // The comparison glyphs. All six, because they are markup injected by three
    // different mechanisms — `dangerouslySetInnerHTML`, `{@html}` and `v-html` —
    // and "the string went in" is the only thing that proves each one did.
    ...(
      ["equals", "is-any-of", "contains", "does-not-contain", "starts-with", "ends-with"] as const
    ).map((operator) => ({
      name: `operator/${operator}`,
      props: { label: "Name", operator, operatorLabel: operator.replaceAll("-", " ") },
    })),
    { name: "operator/decorative", props: { label: "Name", operator: "equals" } },
    // `detail` loses to `operator`: drawn or spelled, never both.
    {
      name: "operator/wins over detail",
      props: { label: "Name", operator: "contains", detail: "contains" },
    },
  ],
};

export default spec;
