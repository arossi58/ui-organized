import type { ComponentType } from "react";
import {
  Dialog as RDialog,
  DialogTrigger as RDialogTrigger,
  DialogContent as RDialogContent,
  DialogTitle as RDialogTitle,
  DialogDescription as RDialogDescription,
  DialogFooter as RDialogFooter,
} from "@ui-organized/react";
import DialogFixture from "../fixtures/DialogFixture.svelte";
import VueDialogFixture from "../fixtures/vue/DialogFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Dialog",
  react: ({ contentProps = {}, ...p }) => (
    <RDialog {...p}>
      <RDialogTrigger>Open</RDialogTrigger>
      <RDialogContent {...contentProps}>
        <RDialogTitle>Title</RDialogTitle>
        <RDialogDescription>Description</RDialogDescription>
        <RDialogFooter>Footer</RDialogFooter>
      </RDialogContent>
    </RDialog>
  ),
  svelte: DialogFixture as unknown as ComponentType<any>,
  vue: VueDialogFixture as unknown as ComponentType<any>,
  // Trigger only — the rest is portalled. See `ParitySpec.select` in spec.ts.
  select: '[data-part="trigger"]',
  cases: [
    { name: "closed" },
    { name: "modal", props: { modal: true } },
    { name: "non-modal", props: { modal: false } },
  ],
};

export default spec;
