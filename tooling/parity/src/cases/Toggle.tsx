import type { ComponentType } from "react";
import { Toggle as RToggle, ToggleGroup as RToggleGroup } from "@ui-organized/react";
import ToggleFixture from "../fixtures/ToggleFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const items = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right", disabled: true },
];

const spec: ParitySpec = {
  component: "Toggle",
  // `items` switches the fixture from the standalone toggle to the group; a
  // `value` is what makes a Toggle a group item in both libraries.
  react: ({ label, items: groupItems, ...p }) =>
    groupItems ? (
      <RToggleGroup {...p}>
        {(groupItems as typeof items).map((item) => (
          <RToggle key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </RToggle>
        ))}
      </RToggleGroup>
    ) : (
      <RToggle {...p}>{label}</RToggle>
    ),
  svelte: ToggleFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { label: "Bold" } },
    { name: "pressed", props: { label: "Bold", defaultPressed: true } },
    { name: "controlled pressed", props: { label: "Bold", pressed: true } },
    { name: "disabled", props: { label: "Bold", disabled: true } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { label: "Bold", size } })),
    // No label at all: the icon-only square. React tests its children for
    // emptiness, Svelte can only ask whether the snippet was passed — this is
    // the case that pins the two to the same answer.
    { name: "icon only", props: { icon: "check" } },
    { name: "icon and label", props: { icon: "check", label: "Bold" } },
    ...SIZES.map((size) => ({ name: `icon only/${size}`, props: { icon: "check", size } })),
    { name: "extra class", props: { label: "Bold", className: "custom" } },
    { name: "group", props: { items } },
    { name: "group/multiple", props: { items, multiple: true } },
    { name: "group/vertical", props: { items, orientation: "vertical" } },
    { name: "group/selected", props: { items, defaultValue: ["center"] } },
    { name: "group/disabled", props: { items, disabled: true } },
  ],
};

export default spec;
