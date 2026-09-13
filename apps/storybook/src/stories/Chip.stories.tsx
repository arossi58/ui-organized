import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Chip, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/react";

const SIZES = ["sm", "md", "lg"] as const;

/** The relations the design system draws rather than spells. */
const OPERATORS = [
  ["equals", "is"],
  ["is-any-of", "is any of"],
  ["contains", "contains"],
  ["does-not-contain", "does not contain"],
  ["starts-with", "starts with"],
  ["ends-with", "ends with"],
] as const;

const meta: Meta<typeof Chip> = {
  title: "Components/Data Display/Chip",
  component: Chip,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Chips stand for something the user *added* — a filter, a facet, a recipient — and can then change or take away. That is the difference from `Tag`, which reports status the user did not choose and is not interactive.\n\nA chip reads as a short sentence: `label` names the thing, the middle is the relation, and the children are the value. Only the value truncates.\n\nThe relation is either **drawn or spelled**. `operator` picks one of the design system\'s six comparison glyphs — `equals`, `is-any-of`, `contains`, `does-not-contain`, `starts-with`, `ends-with` — and `detail` is the fallback for relations that have no glyph ("is in the last", "is between"). Always pass `operatorLabel` with a glyph: it becomes the glyph\'s accessible name, so the chip still reads as "Name contains ada" to a screen reader.\n\nSet `onRemove` for a dismiss control — it renders as a **sibling** of the chip\'s body, never nested, so a chip that both opens something and removes itself is still two valid buttons. Every prop except `className` lands on the body, which is what lets an overlay trigger project itself onto a chip: `<PopoverTrigger render={<Chip … />} />`.',
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "subtle"] },
    size: { control: "inline-radio", options: SIZES },
    label: { control: "text" },
    detail: { control: "text" },
    operator: {
      control: "select",
      options: [undefined, ...OPERATORS.map(([name]) => name)],
    },
    operatorLabel: { control: "text" },
    children: { control: "text" },
    dropdown: { control: "boolean" },
    selected: { control: "boolean" },
    incomplete: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * The drawn component, exactly (Figma 2298:857) — this is what the docs page
 * and the visual baseline lead with, so it is the design rather than a tour of
 * the props. Everything else is reachable from the controls.
 */
export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Name",
    operator: "is-any-of",
    operatorLabel: "is any of",
    children: "Value",
    variant: "outline",
    size: "md",
    dropdown: false,
  },
};

export const Operators: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The six relations the design system draws. `operatorLabel` is what a screen reader hears in place of the glyph — pass it, or the chip reads as "Name Value" and the relation is lost entirely.',
      },
      source: {
        code: `
<Chip label="Name" operator="equals" operatorLabel="is">Ada</Chip>
<Chip label="Name" operator="is-any-of" operatorLabel="is any of">Ada, Grace</Chip>
<Chip label="Name" operator="contains" operatorLabel="contains">ada</Chip>
<Chip label="Name" operator="does-not-contain" operatorLabel="does not contain">ada</Chip>
<Chip label="Name" operator="starts-with" operatorLabel="starts with">Ad</Chip>
<Chip label="Name" operator="ends-with" operatorLabel="ends with">ce</Chip>

{/* No glyph for this one, so the relation is spelled instead. */}
<Chip label="Joined" detail="is in the last">7 days</Chip>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {OPERATORS.map(([operator, label]) => (
          <Chip key={operator} label="Name" operator={operator} operatorLabel={label}>
            Ada
          </Chip>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Chip label="Joined" detail="is in the last">
          7 days
        </Chip>
        <Chip label="Seats" detail="is between">
          2, 8
        </Chip>
      </div>
    </div>
  ),
};

export const Anatomy: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`label`, `detail` and children are all optional — a chip with only children is a plain token.",
      },
      source: {
        code: `
<Chip>Acme</Chip>
<Chip label="Role">Admin</Chip>
<Chip label="Role" detail="is any of">Admin, Owner</Chip>
<Chip icon="user" label="Owner">Ada Lovelace</Chip>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Chip>Acme</Chip>
      <Chip label="Role">Admin</Chip>
      <Chip label="Role" detail="is any of">
        Admin, Owner
      </Chip>
      <Chip icon="user" label="Owner">
        Ada Lovelace
      </Chip>
    </div>
  ),
};

export const Removable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The dismiss button is icon-only, so `removeLabel` carries the whole meaning — name the condition, not the verb. A row of chips whose buttons all say “Remove” gives assistive tech six identical controls.",
      },
      source: {
        code: `
const [tags, setTags] = useState(["Design", "Engineering", "Support"]);

{tags.map((tag) => (
  <Chip
    key={tag}
    label="Team"
    onRemove={() => setTags((rest) => rest.filter((t) => t !== tag))}
    removeLabel={\`Remove team: \${tag}\`}
  >
    {tag}
  </Chip>
))}
`.trim(),
      },
    },
  },
  render: function Removable() {
    const [tags, setTags] = useState(["Design", "Engineering", "Support"]);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label="Team"
            onRemove={() => setTags((rest) => rest.filter((t) => t !== tag))}
            removeLabel={`Remove team: ${tag}`}
          >
            {tag}
          </Chip>
        ))}
        {tags.length === 0 && <span>All removed.</span>}
      </div>
    );
  },
};

export const AsAMenuTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every prop but `className` lands on the chip's body, so a `MenuTrigger` (or `PopoverTrigger`) can project itself onto a chip and its `id`, `onClick` and `aria-expanded` attach to the button that opens the menu.",
      },
      source: {
        code: `
<Menu>
  <MenuTrigger render={<Chip label="Status" dropdown selected={open}>{status}</Chip>} />
  <MenuContent align="start">
    {["Active", "Paused", "Archived"].map((option) => (
      <MenuItem key={option} value={option} onSelect={() => setStatus(option)}>
        {option}
      </MenuItem>
    ))}
  </MenuContent>
</Menu>
`.trim(),
      },
    },
  },
  render: function AsAMenuTrigger() {
    const [status, setStatus] = useState("Active");
    return (
      <Menu>
        <MenuTrigger
          render={
            <Chip label="Status" dropdown>
              {status}
            </Chip>
          }
        />
        <MenuContent align="start">
          {["Active", "Paused", "Archived"].map((option) => (
            <MenuItem key={option} value={option} onSelect={() => setStatus(option)}>
              {option}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    );
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`selected` is “this is the one you are acting on” — its popover is open, or it is toggled on. `incomplete` is a chip that does not yet stand for anything: a filter with no value picked. Dashed rather than coloured, because it is an invitation and not an error.",
      },
      source: {
        code: `
<Chip label="Role" detail="is any of">Admin</Chip>
<Chip label="Role" detail="is any of" selected dropdown>Admin</Chip>
<Chip label="Role" detail="is any of" incomplete dropdown>Select…</Chip>
<Chip label="Role" detail="is any of" disabled onRemove={noop} removeLabel="Remove role">Admin</Chip>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Chip label="Role" detail="is any of">
        Admin
      </Chip>
      <Chip label="Role" detail="is any of" selected dropdown onClick={() => {}}>
        Admin
      </Chip>
      <Chip label="Role" detail="is any of" incomplete dropdown onClick={() => {}}>
        Select…
      </Chip>
      <Chip
        label="Role"
        detail="is any of"
        disabled
        onRemove={() => {}}
        removeLabel="Remove role filter"
      >
        Admin
      </Chip>
    </div>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`subtle` drops the outline for dense rows where a border per chip starts to read as a grid.",
      },
      source: {
        code: `
<Chip variant="outline" label="Role">Admin</Chip>
<Chip variant="subtle" label="Role">Admin</Chip>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Chip variant="outline" label="Role">
        Admin
      </Chip>
      <Chip variant="subtle" label="Role">
        Admin
      </Chip>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Chip size="sm" label="Role">Admin</Chip>
<Chip size="md" label="Role">Admin</Chip>
<Chip size="lg" label="Role">Admin</Chip>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {SIZES.map((size) => (
        <Chip
          key={size}
          size={size}
          label="Role"
          onRemove={() => {}}
          removeLabel={`Remove ${size}`}
        >
          {size}
        </Chip>
      ))}
    </div>
  ),
};
