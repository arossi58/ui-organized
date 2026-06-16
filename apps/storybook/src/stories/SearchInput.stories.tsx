import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchInput } from "@ui-organized/react";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Forms/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A single-line search field built on `Input` — adds a leading search icon and, while the field has a value, a clear button (toggle with `clearable`). Supports the same `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    label: "Search",
    placeholder: "Search…",
    size: "md",
  },
};

export const WithValue: Story = {
  args: {
    label: "Search",
    placeholder: "Search…",
    defaultValue: "Design system",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Search products",
    placeholder: "Search…",
    helperText: "Search by name, SKU, or category.",
  },
};

export const WithError: Story = {
  args: {
    label: "Search",
    placeholder: "Search…",
    error: "No results match your search.",
  },
};

export const NotClearable: Story = {
  args: {
    label: "Search",
    placeholder: "Search…",
    defaultValue: "Read-only example",
    clearable: false,
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<SearchInput size="sm" label="Small" placeholder="Search…" />
<SearchInput size="md" label="Medium" placeholder="Search…" />
<SearchInput size="lg" label="Large" placeholder="Search…" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <SearchInput size="sm" label="Small" placeholder="Search…" />
      <SearchInput size="md" label="Medium" placeholder="Search…" />
      <SearchInput size="lg" label="Large" placeholder="Search…" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<SearchInput label="Default" placeholder="Search…" />
<SearchInput label="With value" defaultValue="Entered query" />
<SearchInput label="Required" placeholder="Search…" required />
<SearchInput label="With helper" placeholder="Search…" helperText="Search by name or SKU." />
<SearchInput label="Error state" placeholder="Search…" error="No results found." />
<SearchInput label="Disabled" placeholder="Search…" defaultValue="Entered query" disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <SearchInput label="Default" placeholder="Search…" />
      <SearchInput label="With value" defaultValue="Entered query" />
      <SearchInput label="Required" placeholder="Search…" required />
      <SearchInput label="With helper" placeholder="Search…" helperText="Search by name or SKU." />
      <SearchInput label="Error state" placeholder="Search…" error="No results found." />
      <SearchInput label="Disabled" placeholder="Search…" defaultValue="Entered query" disabled />
    </div>
  ),
};

/** Controlled search with a live result count driven from the field's value. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango"];
const [query, setQuery] = useState("");
const matches = fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));

<SearchInput
  label="Search fruit"
  placeholder="Search…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  helperText={query ? matches.length + " match(es)" : "Start typing to filter."}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const fruits = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango"];
    const [query, setQuery] = useState("");
    const matches = fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));
    return (
      <div style={{ maxWidth: "400px" }}>
        <SearchInput
          label="Search fruit"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          helperText={query ? `${matches.length} match(es)` : "Start typing to filter."}
        />
      </div>
    );
  },
};
