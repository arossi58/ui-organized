import { Button, CommandMenu, Kbd, type CommandMenuItem } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const GROUPED: CommandMenuItem[] = [
  { value: "new", label: "Create project", group: "Projects", shortcut: ["mod", "n"] },
  { value: "archive", label: "Archive project", group: "Projects" },
  { value: "invite", label: "Invite people", group: "Team", keywords: ["share", "members"] },
  { value: "roles", label: "Manage roles", group: "Team", keywords: ["permissions"] },
  {
    value: "settings",
    label: "Settings",
    group: "Account",
    keywords: ["preferences"],
    shortcut: ["mod", ","],
  },
];

const FLAT: CommandMenuItem[] = GROUPED.map(({ value, label }) => ({ value, label }));

/** Open by default and contained in the preview, so both halves show at once. */
const staged = { layout: "centered" as const, containOverlays: true };

export const commandMenuExamples: UsageExampleSet = {
  groups: {
    ...staged,
    Do: () => <CommandMenu items={GROUPED} defaultOpen placeholder="Search commands" />,
    // One undivided list, and "share" finds nothing.
    Dont: () => <CommandMenu items={FLAT} defaultOpen placeholder="Search commands" />,
  },

  hotkey: {
    layout: "centered",
    Do: () => (
      <Button intent="secondary">
        Search <Kbd keys={["mod", "k"]} size="sm" />
      </Button>
    ),
    // Nothing says a faster way exists.
    Dont: () => <Button intent="secondary">Search</Button>,
  },
};
