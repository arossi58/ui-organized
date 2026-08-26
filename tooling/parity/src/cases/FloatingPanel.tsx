import type { ComponentType } from "react";
import {
  FloatingPanel as RFloatingPanel,
  FloatingPanelTrigger as RFloatingPanelTrigger,
  FloatingPanelContent as RFloatingPanelContent,
  FloatingPanelHeader as RFloatingPanelHeader,
  FloatingPanelTitle as RFloatingPanelTitle,
  FloatingPanelBody as RFloatingPanelBody,
  FloatingPanelClose as RFloatingPanelClose,
} from "@ui-organized/react";
import FloatingPanelFixture from "../fixtures/FloatingPanelFixture.svelte";
import VueFloatingPanelFixture from "../fixtures/vue/FloatingPanelFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * The trigger is the whole of what a static render can compare, and it is worth
 * being blunt about how little that is.
 *
 * `FloatingPanelContent` portals everything else — the panel surface, its
 * header, drag handle, title, close button, body and all eight resize triggers
 * — and the three renderers disagree about portals under SSR (see
 * `ParitySpec.select` in spec.ts). So `size`, `variant`, the header chrome and
 * the resize handles are **not** pinned by anything below; they belong to the
 * Playwright harness, which opens the panel in a real browser.
 *
 * The cases that pass those props anyway are doing what Popover's side/align
 * cases do: the values live on Content and Root respectively, so passing them
 * exercises each library's props hand-off rather than the markup it produces.
 *
 * `exclude` rather than `select`, because excluding the positioner leaves the
 * comparison over *everything else the component renders* — which is how a port
 * that leaked part of the panel outside the portal would be caught. Selecting
 * the trigger would quietly select that bug away.
 */
const spec: ParitySpec = {
  component: "FloatingPanel",
  react: ({ triggerProps = {}, triggerClass, contentProps = {}, ...p }) => (
    <RFloatingPanel {...p}>
      <RFloatingPanelTrigger className={triggerClass} {...triggerProps}>
        Open
      </RFloatingPanelTrigger>
      <RFloatingPanelContent {...contentProps}>
        <RFloatingPanelHeader>
          <RFloatingPanelTitle>Title</RFloatingPanelTitle>
          <RFloatingPanelClose />
        </RFloatingPanelHeader>
        <RFloatingPanelBody>Body</RFloatingPanelBody>
      </RFloatingPanelContent>
    </RFloatingPanel>
  ),
  svelte: FloatingPanelFixture as unknown as ComponentType<any>,
  vue: VueFloatingPanelFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="floating-panel"][data-part="positioner"]',
  cases: [
    { name: "closed" },
    // Open state reaches the trigger's data-state, so these are the cases that
    // actually distinguish two renders rather than two absences.
    { name: "default open", props: { defaultOpen: true } },
    { name: "controlled open", props: { open: true } },
    // Worth its own case in Vue's company: an absent Boolean prop casts to
    // `false` there, so "controlled and closed" and "uncontrolled" are one
    // keystroke apart. See definedOnly in packages/vue/src/props.ts.
    { name: "controlled closed", props: { open: false } },
    { name: "disabled trigger", props: { triggerProps: { disabled: true } } },
    // The trigger is a bare props spread in all three libraries, so this is the
    // one class the gate can follow from the case to the DOM.
    { name: "custom trigger class", props: { triggerClass: "mine" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { contentProps: { size } } })),
    ...(["default", "elevated"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { contentProps: { variant } },
    })),
    { name: "not draggable", props: { draggable: false } },
    { name: "not resizable", props: { resizable: false } },
    {
      name: "sized and positioned",
      props: {
        defaultSize: { width: 480, height: 320 },
        minSize: { width: 240, height: 160 },
        maxSize: { width: 720, height: 640 },
        defaultPosition: { x: 120, y: 80 },
      },
    },
    ...(["absolute", "fixed"] as const).map((strategy) => ({
      name: `strategy/${strategy}`,
      props: { strategy },
    })),
  ],
  stylesheets: ["FloatingPanel/FloatingPanel.css"],
  allow: [
    {
      attribute: "aria-controls",
      reason:
        "The trigger points at the panel's content id, and the content is " +
        "portalled — so React, which renders a portal inline under SSR, issues " +
        "that id and Svelte and Vue do not. The contract normaliser numbers the " +
        "ids it finds, so an id nothing issued survives as the literal each " +
        "renderer produced: `float::R0::content` against `float:s1:content`. " +
        "Every other Ark component escapes this because the machine id can be " +
        "recovered from a rendered part's `<scope>:<machine>:<part>` id, but " +
        "floating-panel is the one whose scope (`floating-panel`) is not its id " +
        "prefix (`float`), and its Root renders no element to recover it from. " +
        "All three libraries emit the same attribute from the same zag " +
        "getTriggerProps; only the id scheme differs, and FloatingPanel.css " +
        "selects on [data-dragging] alone. The trigger's own wiring is still " +
        "compared through data-state and the id placeholder.",
    },
  ],
};

export default spec;
