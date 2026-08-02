import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelClose,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelTrigger,
} from "@ui-organized/react";

const meta: Meta<typeof FloatingPanel> = {
  title: "Components/Overlay/FloatingPanel",
  component: FloatingPanel,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A draggable, resizable window that floats above the page — inspectors, tool palettes, anything a person wants to reposition and keep open while working. Unlike `Dialog` it is non-modal by design: the page behind it stays interactive.\n\nThe whole header is the drag handle, which is why `FloatingPanelTitle` and `FloatingPanelClose` go inside `FloatingPanelHeader`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingPanel>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ minHeight: 360 }}>
      <FloatingPanel {...args}>
        <FloatingPanelTrigger>
          <Button intent="secondary">Open panel</Button>
        </FloatingPanelTrigger>
        <FloatingPanelContent>
          <FloatingPanelHeader>
            <FloatingPanelTitle>Layer inspector</FloatingPanelTitle>
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>
            Drag the header to move this panel, or pull any edge to resize it.
          </FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    </div>
  ),
  args: {
    defaultOpen: true,
    defaultPosition: { x: 24, y: 24 },
    strategy: "absolute",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ minHeight: 320 }}>
      <FloatingPanel defaultOpen defaultPosition={{ x: 16, y: 16 }} strategy="absolute">
        <FloatingPanelTrigger>
          <Button intent="secondary">Open</Button>
        </FloatingPanelTrigger>
        <FloatingPanelContent size="sm" variant="elevated">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Small, elevated</FloatingPanelTitle>
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>A compact palette.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<FloatingPanel defaultOpen>
  <FloatingPanelTrigger>
    <Button intent="secondary">Open</Button>
  </FloatingPanelTrigger>
  <FloatingPanelContent size="sm" variant="elevated">
    <FloatingPanelHeader>
      <FloatingPanelTitle>Small, elevated</FloatingPanelTitle>
      <FloatingPanelClose />
    </FloatingPanelHeader>
    <FloatingPanelBody>A compact palette.</FloatingPanelBody>
  </FloatingPanelContent>
</FloatingPanel>`,
      },
    },
  },
};

export const NotResizable: Story = {
  render: () => (
    <div style={{ minHeight: 320 }}>
      <FloatingPanel
        defaultOpen
        resizable={false}
        defaultPosition={{ x: 16, y: 16 }}
        strategy="absolute"
      >
        <FloatingPanelTrigger>
          <Button intent="secondary">Open</Button>
        </FloatingPanelTrigger>
        <FloatingPanelContent>
          <FloatingPanelHeader>
            <FloatingPanelTitle>Fixed size</FloatingPanelTitle>
            <FloatingPanelClose />
          </FloatingPanelHeader>
          <FloatingPanelBody>Draggable, but the edges do not resize.</FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* strategy="absolute" keeps the panel inside a scrolling container
    rather than the viewport. */}
<FloatingPanel defaultOpen resizable={false}>
  …
</FloatingPanel>`,
      },
    },
  },
};
