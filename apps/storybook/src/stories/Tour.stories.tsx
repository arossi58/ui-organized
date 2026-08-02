import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Tour, type TourStep } from "@ui-organized/react";

const meta: Meta<typeof Tour> = {
  title: "Components/Overlay/Tour",
  component: Tour,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A guided walkthrough — a dimmed backdrop, a spotlight over the target, and a card beside it.\n\n`Tour` is **controlled only**: the machine has no `defaultStepId`, so `stepId` is the single control surface and `null` closes the tour. Hold it in state and set it to the first step's id to start. A step with no `target` is treated as a centred modal step.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "compact"] },
  },
};

export default meta;
type Story = StoryObj<typeof Tour>;

function TourDemo({
  size,
  variant,
  initialStepId = null,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
  /** Seeds the controlled `stepId`, so a story can render mid-tour. */
  initialStepId?: string | null;
}) {
  /* Refs go on wrapper elements, not on `Button`/`Card` directly: those are
     plain function components in this library and do not forward refs, so a ref
     placed on them stays null and `target()` returns nothing to anchor to. */
  const saveRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [stepId, setStepId] = useState<string | null>(null);

  /* Set after mount, not as the initial state. Refs attach on commit, so a tour
     opened during the first render measures a null target: the spotlight
     collapses to 0×0 and popper parks the card off-screen at -100vh. In real
     use a tour is started by a click, which is always after mount — this effect
     is what reproduces that ordering in a story. */
  useEffect(() => {
    if (initialStepId) setStepId(initialStepId);
  }, [initialStepId]);

  const steps: TourStep[] = [
    {
      id: "welcome",
      title: "Welcome",
      description: "A two-minute tour of what changed in this release.",
      // No target — the machine treats this as a centred modal step.
      actions: [{ label: "Start", action: "next" }],
    },
    {
      id: "save",
      title: "Save your work",
      description: "Changes are saved here, and autosaved every thirty seconds.",
      target: () => saveRef.current,
      placement: "bottom",
    },
    {
      id: "panel",
      title: "The details panel",
      description: "Everything about the current selection lives in this panel.",
      target: () => panelRef.current,
      placement: "top",
      actions: [
        { label: "Back", action: "prev" },
        { label: "Done", action: "dismiss" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 320 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button onClick={() => setStepId("welcome")}>Start tour</Button>
        <span ref={saveRef} style={{ display: "inline-flex" }}>
          <Button intent="secondary">Save</Button>
        </span>
      </div>

      <div ref={panelRef}>
        <Card>
          <div style={{ padding: 16 }}>Details panel</div>
        </Card>
      </div>

      <Tour
        steps={steps}
        stepId={stepId}
        onStepChange={setStepId}
        size={size}
        variant={variant}
      />
    </div>
  );
}

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => <TourDemo size={args.size} variant={args.variant} />,
  args: { size: "md", variant: "default" },
};

export const ModalStep: Story = {
  render: () => <TourDemo initialStepId="welcome" />,
  parameters: {
    docs: {
      source: {
        code: `{/* A step with no target is treated as a centred modal step. */}
<Tour steps={steps} stepId="welcome" onStepChange={setStepId} />`,
      },
    },
  },
};

export const AnchoredStep: Story = {
  render: () => <TourDemo initialStepId="save" />,
  parameters: {
    docs: {
      source: {
        code: `{/* A step with a target anchors to it and spotlights it. */}
<Tour steps={steps} stepId="save" onStepChange={setStepId} />`,
      },
    },
  },
};

export const Compact: Story = {
  render: () => <TourDemo variant="compact" size="sm" initialStepId="welcome" />,
  parameters: {
    docs: {
      source: {
        code: `const [stepId, setStepId] = useState<string | null>(null);

// Controlled only — null closes the tour, an id opens it at that step.
<Tour steps={steps} stepId={stepId} onStepChange={setStepId} variant="compact" size="sm" />`,
      },
    },
  },
};
