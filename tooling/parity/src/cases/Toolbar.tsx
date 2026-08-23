import type { ComponentType } from "react";
import {
  Button as RButton,
  Divider as RDivider,
  Toolbar as RToolbar,
  ToolbarGroup as RToolbarGroup,
} from "@ui-organized/react";
import VueToolbarFixture from "../fixtures/vue/ToolbarFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Composed from the library's own controls rather than bare `<button>`s,
 * because that is what the component is for: it owns the surface and the gaps,
 * and the guidance is to fill it with `Button`, `Input` and `Divider`. Button
 * and Divider have their own specs, so a failure here is the toolbar's.
 */
const spec: ParitySpec = {
  component: "Toolbar",
  react: (p) => (
    <RToolbar {...p}>
      <RToolbarGroup>
        <RButton intent="ghost" size="sm">Bold</RButton>
        <RButton intent="ghost" size="sm">Italic</RButton>
      </RToolbarGroup>
      <RDivider orientation="vertical" />
      <RButton intent="ghost" size="sm">Link</RButton>
    </RToolbar>
  ),
  vue: VueToolbarFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    // `data-orientation` is what the stylesheet turns the flex direction on, so
    // this is the case that catches a vertical toolbar laid out horizontally.
    { name: "vertical", props: { orientation: "vertical" } },
  ],
};

export default spec;
