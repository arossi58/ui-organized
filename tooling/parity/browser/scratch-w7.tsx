import { useState } from "react";
import { createRoot } from "react-dom/client";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import {
  FloatingPanel,
  FloatingPanelTrigger,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelBody,
  FloatingPanelClose,
  Tour,
} from "@ui-organized/react";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";

const { component, props } = caseFromUrl();

function Panel(p: any) {
  return (
    <FloatingPanel {...p}>
      <FloatingPanelTrigger>Open</FloatingPanelTrigger>
      <FloatingPanelContent size={p.size} variant={p.variant}>
        <FloatingPanelHeader>
          <FloatingPanelTitle>Layers</FloatingPanelTitle>
          <FloatingPanelClose />
        </FloatingPanelHeader>
        <FloatingPanelBody>Body copy</FloatingPanelBody>
      </FloatingPanelContent>
    </FloatingPanel>
  );
}

function TourFixture(p: any) {
  const [stepId, setStepId] = useState<string | null>(p.stepId ?? null);
  const steps = (p.steps ?? []).map((s: any) => ({
    ...s,
    ...(s.targetId ? { target: () => document.getElementById(s.targetId) } : {}),
  }));
  return (
    <>
      <button id="anchor" onClick={() => setStepId(steps[0]?.id ?? null)}>
        Start
      </button>
      <Tour {...p} steps={steps} stepId={stepId} onStepChange={setStepId} />
    </>
  );
}

const map: Record<string, (p: any) => any> = {
  FloatingPanel: (p) => <Panel {...p} />,
  Tour: (p) => <TourFixture {...p} />,
};

createRoot(mountPoint()).render(map[component]!(props));
signalReady();
