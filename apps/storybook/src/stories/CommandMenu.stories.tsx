import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, CommandMenu, Kbd, type CommandMenuItem } from "@ui-organized/react";

const COMMANDS: CommandMenuItem[] = [
  { value: "new", label: "New file", group: "File", icon: "file-plus", shortcut: ["mod", "n"] },
  { value: "open", label: "Open file", group: "File", icon: "folder-open", shortcut: ["mod", "o"] },
  { value: "save", label: "Save", group: "File", icon: "save", shortcut: ["mod", "s"] },
  {
    value: "settings",
    label: "Settings",
    group: "General",
    icon: "settings",
    keywords: ["preferences"],
    shortcut: ["mod", ","],
  },
  { value: "theme", label: "Toggle theme", group: "General", icon: "sun-moon", disabled: true },
  { value: "help", label: "Help and feedback", icon: "circle-help" },
];

/**
 * `platform` is pinned so the shortcuts draw the same on every machine that
 * takes a baseline; see Kbd's stories.
 */
const meta: Meta<typeof CommandMenu> = {
  title: "Components/Overlay/CommandMenu",
  component: CommandMenu,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A search box over a list of commands, in a dialog near the top of the screen. Type to filter, arrows to move, Enter to run.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenu>;

function WithTrigger(props: Partial<React.ComponentProps<typeof CommandMenu>>) {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <Button intent="secondary" onClick={() => setOpen(true)}>
        Search <Kbd keys={["mod", "k"]} size="sm" platform="mac" />
      </Button>
      {last && <span className="text-default-body-small">Ran: {last}</span>}
      <CommandMenu
        items={COMMANDS}
        platform="mac"
        hotkey="mod+k"
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSelect={setLast}
      />
    </div>
  );
}

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => <WithTrigger {...args} />,
  args: { placeholder: "Type a command or search…", emptyMessage: "No results found." },
};

/** Open from the start, as the reader sees it after ⌘K. */
export const Open: Story = {
  render: () => <CommandMenu items={COMMANDS} platform="mac" defaultOpen />,
};

/** A button and the ⌘K hotkey both open it; the menu reports what ran. */
export const WithHotkey: Story = {
  render: () => <WithTrigger />,
};
