import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelClose,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/**
 * Every panel opens by default at a fixed spot and size inside its card, so both
 * halves are visible side by side.
 */
const staged = { layout: "padded" as const, containOverlays: true };
const place = {
  defaultOpen: true,
  defaultPosition: { x: 16, y: 16 },
  defaultSize: { width: 280, height: 160 },
};

export const floatingPanelExamples: UsageExampleSet = {
  titled: {
    ...staged,
    Do: () => (
      <FloatingPanel {...place}>
        <FloatingPanelContent size="sm">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Layers</FloatingPanelTitle>
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>Background, Header, Footer.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    ),
    // An empty header: nothing names the panel or shows where to grab it.
    Dont: () => (
      <FloatingPanel {...place}>
        <FloatingPanelContent size="sm">
          <FloatingPanelHeader>
            <span />
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>Background, Header, Footer.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    ),
  },

  closable: {
    ...staged,
    Do: () => (
      <FloatingPanel {...place}>
        <FloatingPanelContent size="sm">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Properties</FloatingPanelTitle>
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>Width 240, height 120.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    ),
    // No close button, so the panel can only be dismissed from wherever it was opened.
    Dont: () => (
      <FloatingPanel {...place}>
        <FloatingPanelContent size="sm">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Properties</FloatingPanelTitle>
          </FloatingPanelHeader>
          <FloatingPanelBody>Width 240, height 120.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    ),
  },
};
