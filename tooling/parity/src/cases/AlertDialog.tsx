import type { ComponentType } from "react";
import {
  AlertDialog as RAlertDialog,
  AlertDialogTrigger as RAlertDialogTrigger,
  AlertDialogContent as RAlertDialogContent,
  AlertDialogTitle as RAlertDialogTitle,
  AlertDialogDescription as RAlertDialogDescription,
  AlertDialogFooter as RAlertDialogFooter,
  AlertDialogCancel as RAlertDialogCancel,
  AlertDialogConfirm as RAlertDialogConfirm,
} from "@ui-organized/react";
import VueAlertDialogFixture from "../fixtures/vue/AlertDialogFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "AlertDialog",
  react: ({ contentProps = {}, confirmProps = {}, ...p }) => (
    <RAlertDialog {...p}>
      <RAlertDialogTrigger>Delete</RAlertDialogTrigger>
      <RAlertDialogContent {...contentProps}>
        <RAlertDialogTitle>Title</RAlertDialogTitle>
        <RAlertDialogDescription>Description</RAlertDialogDescription>
        <RAlertDialogFooter>
          <RAlertDialogCancel>Cancel</RAlertDialogCancel>
          <RAlertDialogConfirm {...confirmProps}>Confirm</RAlertDialogConfirm>
        </RAlertDialogFooter>
      </RAlertDialogContent>
    </RAlertDialog>
  ),
  // No Svelte fixture: AlertDialog is not in that package yet, and a spec
  // missing a library is simply not compared against it.
  vue: VueAlertDialogFixture as unknown as ComponentType<any>,
  // Both, and the combination matters — see Menu.tsx for the same pairing. The
  // portalled half is dropped first so the two sides agree on what ids exist,
  // then the trigger is what remains to compare. See `ParitySpec.select`.
  exclude: '[data-scope="dialog"][data-part="backdrop"], [data-scope="dialog"][data-part="positioner"]',
  select: '[data-part="trigger"]',
  cases: [
    // Closed is where popupControls earns its place: the content is unmounted,
    // so Ark's aria-controls on the trigger would name nothing.
    { name: "closed" },
    // …and open is where it must come back, pointing at the content again.
    { name: "open", props: { defaultOpen: true } },
  ],
};

export default spec;
