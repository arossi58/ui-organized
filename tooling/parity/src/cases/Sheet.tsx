import type { ComponentType } from "react";
import {
  Sheet as RSheet,
  SheetTrigger as RSheetTrigger,
  SheetContent as RSheetContent,
  SheetTitle as RSheetTitle,
  SheetDescription as RSheetDescription,
  SheetClose as RSheetClose,
  SheetFooter as RSheetFooter,
} from "@ui-organized/react";
import SheetFixture from "../fixtures/SheetFixture.svelte";
import VueSheetFixture from "../fixtures/vue/SheetFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Sheet",
  react: ({ contentProps = {}, ...p }) => (
    <RSheet {...p}>
      <RSheetTrigger>Open</RSheetTrigger>
      <RSheetContent {...contentProps}>
        <RSheetTitle>Title</RSheetTitle>
        <RSheetDescription>Description</RSheetDescription>
        <RSheetFooter>
          <RSheetClose>Close</RSheetClose>
        </RSheetFooter>
      </RSheetContent>
    </RSheet>
  ),
  svelte: SheetFixture as unknown as ComponentType<any>,
  vue: VueSheetFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="dialog"][data-part="backdrop"], [data-scope="dialog"][data-part="positioner"]',
  select: '[data-part="trigger"]',
  cases: [
    { name: "closed" },
    { name: "open", props: { defaultOpen: true } },
    { name: "modal", props: { modal: true } },
    // The one that would have caught the Vue boolean trap: an absent Boolean
    // prop is cast to `false`, so "modal: false" and "modal not mentioned" are
    // different states that must stay different. See packages/vue/src/props.ts.
    { name: "non-modal", props: { modal: false } },
  ],
};

export default spec;
