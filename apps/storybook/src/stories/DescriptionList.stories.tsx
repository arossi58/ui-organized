import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardBody, DescriptionList, DescriptionListItem, Tag } from "@ui-organized/react";

const ITEMS = [
  { term: "Plan", details: "Pro, billed yearly" },
  { term: "Seats", details: "12 of 20" },
  { term: "Renews", details: "1 March 2027" },
  { term: "Billing contact", details: "accounts@northwind.example" },
];

const meta: Meta<typeof DescriptionList> = {
  title: "Components/Data Display/DescriptionList",
  component: DescriptionList,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Terms and their details, such as a record's fields. Every term lines up in one column, however long its neighbours are.",
      },
    },
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["inline", "stacked"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    divided: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { items: ITEMS, layout: "inline", size: "md", divided: false },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <DescriptionList {...args} />
    </div>
  ),
};

/** `items` for plain data. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <DescriptionList items={ITEMS} />
    </div>
  ),
};

/** A rule between rows, here in a card. */
export const Divided: Story = {
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <CardBody>
        <DescriptionList items={ITEMS} divided />
      </CardBody>
    </Card>
  ),
};

/** The details under their term, for a narrow column. */
export const Stacked: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <DescriptionList items={ITEMS} layout="stacked" />
    </div>
  ),
};

/** `DescriptionListItem` children when the details need markup. */
export const WithMarkup: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <DescriptionList divided>
        <DescriptionListItem term="Status">
          <Tag variant="success" size="sm" appearance="subtle">
            Active
          </Tag>
        </DescriptionListItem>
        <DescriptionListItem term="Owner">Ada Lovelace</DescriptionListItem>
        <DescriptionListItem term="Repository">
          <a href="https://example.com/northwind/storefront">northwind/storefront</a>
        </DescriptionListItem>
        <DescriptionListItem term="Notes">
          A long value wraps within its column, and its term stays at the top of the row.
        </DescriptionListItem>
      </DescriptionList>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
      <DescriptionList items={ITEMS} size="sm" />
      <DescriptionList items={ITEMS} size="md" />
    </div>
  ),
};
