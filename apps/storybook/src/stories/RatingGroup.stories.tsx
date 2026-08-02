import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingGroup } from "@ui-organized/react";

const meta: Meta<typeof RatingGroup> = {
  title: "Components/Forms/RatingGroup",
  component: RatingGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A star rating. Every star is a radio in a group, so it is keyboard-operable and announces its position — this is a form control, not a row of buttons. Use `readOnly` to display a rating that was already given.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "warning"] },
    count: { control: { type: "range", min: 3, max: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof RatingGroup>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Rate this article",
    count: 5,
    defaultValue: 3,
    size: "md",
    variant: "default",
  },
};

export const HalfStars: Story = {
  render: () => (
    <RatingGroup label="Overall score" count={5} defaultValue={3.5} allowHalf />
  ),
  parameters: {
    docs: {
      source: {
        code: `<RatingGroup label="Overall score" count={5} defaultValue={3.5} allowHalf />`,
      },
    },
  },
};

export const ReadOnly: Story = {
  render: () => (
    <RatingGroup
      label="Average rating"
      helperText="Based on 1,204 reviews."
      count={5}
      value={4}
      readOnly
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<RatingGroup
  label="Average rating"
  helperText="Based on 1,204 reviews."
  count={5}
  value={4}
  readOnly
/>`,
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <RatingGroup label="Default" defaultValue={4} />
      <RatingGroup label="Warning" variant="warning" defaultValue={2} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<RatingGroup label="Default" defaultValue={4} />
<RatingGroup label="Warning" variant="warning" defaultValue={2} />`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <RatingGroup label="Small" size="sm" defaultValue={3} />
      <RatingGroup label="Medium" size="md" defaultValue={3} />
      <RatingGroup label="Large" size="lg" defaultValue={3} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<RatingGroup label="Small"  size="sm" defaultValue={3} />
<RatingGroup label="Medium" size="md" defaultValue={3} />
<RatingGroup label="Large"  size="lg" defaultValue={3} />`,
      },
    },
  },
};
