import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "@ui-organized/react";
import type { AccordionItem } from "@ui-organized/react";

const ITEMS: AccordionItem[] = [
  {
    value: "what",
    title: "What is this design system?",
    content:
      "A React component library built on Base UI primitives, themed with design tokens.",
  },
  {
    value: "how",
    title: "How do I install it?",
    content: "Add @ui-organized/react and import the stylesheet once at your app root.",
  },
  {
    value: "themes",
    title: "Does it support dark mode?",
    content: "Yes — toggle the data-theme attribute and every component re-themes instantly.",
    disabled: false,
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Components/Disclosure/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A vertically stacked set of expandable panels. Pass an `items` array; use `multiple`, `variant`, and `size`.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "bordered", "separated"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    multiple: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Accordion {...args} />
    </div>
  ),
  args: { items: ITEMS, multiple: true, variant: "default", size: "md", defaultValue: ["what"] },
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 24 }}>
      {(["default", "bordered", "separated"] as const).map((variant) => (
        <Accordion key={variant} items={ITEMS} variant={variant} defaultValue={["what"]} />
      ))}
    </div>
  ),
};
