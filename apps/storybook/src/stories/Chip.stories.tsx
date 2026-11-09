import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Chip,
  ChipSegment,
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@ui-organized/react";

const meta: Meta<typeof Chip> = {
  title: "Components/Data Display/Chip",
  component: Chip,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A filter or property the user has added and may customize.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    operator: { control: "text" },
    value: { control: "text" },
    selected: { control: "boolean" },
    incomplete: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * The drawn component, exactly (Figma 2462:2636). This is what the docs page
 * and the visual baseline lead with, so it is the design rather than a tour of
 * the props. Everything else is reachable from the controls.
 */
export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Name",
    operator: "is greater than",
    value: "Value",
  },
};

const FIELDS = ["Name", "Age", "Joined"];
const OPERATORS = ["is", "is greater than", "is less than", "is between"];
const VALUES = ["18", "30", "65"];

export const Segmented: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each segment opens the menu for the one parameter it shows. `ChipSegment` passes every prop through, so a `MenuTrigger` (or `PopoverTrigger`) projects onto exactly the segment it belongs to. Fill the chip with `selected` while any of its menus is open.",
      },
      source: {
        code: `
<Chip selected={open !== null}>
  <Menu open={open === "field"} onOpenChange={(next) => setOpen(next ? "field" : null)}>
    <MenuTrigger render={<ChipSegment part="label">{field}</ChipSegment>} />
    <MenuContent>
      <MenuRadioGroup value={field} onValueChange={setField}>
        {fields.map((f) => <MenuRadioItem key={f} value={f}>{f}</MenuRadioItem>)}
      </MenuRadioGroup>
    </MenuContent>
  </Menu>
  {/* …the same for part="operator" and part="value" */}
</Chip>
`.trim(),
      },
    },
  },
  render: function Segmented() {
    const [open, setOpen] = useState<string | null>(null);
    const [field, setField] = useState("Age");
    const [operator, setOperator] = useState("is greater than");
    const [value, setValue] = useState("30");

    const segment = (
      name: string,
      part: "label" | "operator" | "value",
      current: string,
      options: string[],
      onChange: (next: string) => void,
    ) => (
      <Menu open={open === name} onOpenChange={(next) => setOpen(next ? name : null)}>
        <MenuTrigger render={<ChipSegment part={part}>{current}</ChipSegment>} />
        <MenuContent>
          <MenuRadioGroup value={current} onValueChange={onChange}>
            {options.map((option) => (
              <MenuRadioItem key={option} value={option}>
                {option}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );

    return (
      <Chip selected={open !== null} aria-label={`Filter: ${field} ${operator} ${value}`}>
        {segment("field", "label", field, FIELDS, setField)}
        {segment("operator", "operator", operator, OPERATORS, setOperator)}
        {segment("value", "value", value, VALUES, setValue)}
      </Chip>
    );
  },
};

export const Anatomy: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`label`, `operator` and `value` are all optional, and each becomes a segment. The operator is always spelled. A chip with only a value is a plain token.",
      },
      source: {
        code: `
<Chip value="Acme" />
<Chip label="Role" value="Admin" />
<Chip label="Role" operator="is any of" value="Admin, Owner" />
<Chip label="Joined" operator="is in the last" value="7 days" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Chip value="Acme" />
      <Chip label="Role" value="Admin" />
      <Chip label="Role" operator="is any of" value="Admin, Owner" />
      <Chip label="Joined" operator="is in the last" value="7 days" />
    </div>
  ),
};

export const Removable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The dismiss button is icon-only, so `removeLabel` carries the whole meaning. Name the condition, not the verb: a row of chips whose buttons all say "Remove" gives assistive tech six identical controls.',
      },
      source: {
        code: `
const [tags, setTags] = useState(["Design", "Engineering", "Support"]);

{tags.map((tag) => (
  <Chip
    key={tag}
    label="Team"
    value={tag}
    onRemove={() => setTags((rest) => rest.filter((t) => t !== tag))}
    removeLabel={\`Remove team: \${tag}\`}
  />
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
            value={tag}
            onRemove={() => setTags((rest) => rest.filter((t) => t !== tag))}
            removeLabel={`Remove team: ${tag}`}
          />
        ))}
        {tags.length === 0 && <span>All removed.</span>}
      </div>
    );
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`selected` means "this is the one you are acting on": one of its menus is open, or it is toggled on, and it fills with the brand color. `incomplete` is a chip that does not yet stand for anything, such as a filter with no value picked. It is dashed rather than colored because it is an invitation, not an error.',
      },
      source: {
        code: `
<Chip label="Role" operator="is any of" value="Admin" />
<Chip label="Role" operator="is any of" value="Admin" selected />
<Chip label="Role" operator="is any of" value="Select…" incomplete />
<Chip label="Role" operator="is any of" value="Admin" disabled onRemove={noop} removeLabel="Remove role" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Chip label="Role" operator="is any of" value="Admin" />
      <Chip selected>
        <ChipSegment part="label" onClick={() => {}}>
          Role
        </ChipSegment>
        <ChipSegment part="operator" onClick={() => {}}>
          is any of
        </ChipSegment>
        <ChipSegment onClick={() => {}}>Admin</ChipSegment>
      </Chip>
      <Chip incomplete>
        <ChipSegment part="label" onClick={() => {}}>
          Role
        </ChipSegment>
        <ChipSegment part="operator" onClick={() => {}}>
          is any of
        </ChipSegment>
        <ChipSegment onClick={() => {}}>Select…</ChipSegment>
      </Chip>
      <Chip
        label="Role"
        operator="is any of"
        value="Admin"
        disabled
        onRemove={() => {}}
        removeLabel="Remove role filter"
      />
    </div>
  ),
};
