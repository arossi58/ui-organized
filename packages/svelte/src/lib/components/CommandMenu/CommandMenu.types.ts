import type { KbdPlatform } from "@ui-organized/core";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface CommandMenuItem {
  /** Passed to `onSelect` when the command runs. Unique within the menu. */
  value: string;
  /** The command's name, and what typing filters against. */
  label: string;
  /** A heading the command is listed under. Commands keep their order within a group. */
  group?: string;
  /** An icon before the label: its native name, or a library icon component. */
  icon?: IconName | IconComponent;
  /** Keys shown at the end of the row, such as `["mod", "s"]`. Display only: nothing listens for them. */
  shortcut?: string[];
  /** Other words that should find the command, such as `["preferences"]` for "Settings". */
  keywords?: string[];
  /** Listed but cannot run. */
  disabled?: boolean;
}

export interface CommandMenuProps {
  /** The commands, in order. */
  items: CommandMenuItem[];
  /** Open state. Use `bind:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes: by `hotkey`, Escape, a click outside, or running a command. */
  onOpenChange?: (open: boolean) => void;
  /** Called with a command's `value` when it runs, by click or Enter. */
  onSelect?: (value: string) => void;
  /** Whether running a command closes the menu. Defaults to true. */
  closeOnSelect?: boolean;
  /** Placeholder in the search box. Defaults to "Type a command or search…". */
  placeholder?: string;
  /** Shown when nothing matches. Defaults to "No results found.". */
  emptyMessage?: string;
  /** The menu's accessible name, for the dialog, the search box and the list. Defaults to "Command menu". */
  label?: string;
  /**
   * A shortcut that toggles the menu from anywhere on the page, such as
   * `"mod+k"`. Off unless set, so two menus on a page never fight over it.
   */
  hotkey?: string;
  /** Whose keys the rows' shortcuts draw. Defaults to `auto`. */
  platform?: KbdPlatform;
  /** DOM element to portal the menu into. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}
