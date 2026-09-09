import type { ControlSize } from "@ui-organized/core";

export interface ClipboardProps {
  /** The text copied to the clipboard. */
  value: string;
  /** Accessible label text rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. */
  helperText?: string;
  /**
   * Layout. `input` shows the value in a read-only field with a copy button
   * attached; `button` is the button alone. Defaults to 'input'.
   */
  variant?: "input" | "button";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Text on the trigger before copying. Defaults to 'Copy'. */
  copyLabel?: string;
  /** Text on the trigger just after copying. Defaults to 'Copied'. */
  copiedLabel?: string;
  /**
   * Milliseconds the copied state stays visible before reverting.
   * Defaults to 3000.
   */
  timeout?: number;
  /** Called when the copied state changes. */
  onStatusChange?: (copied: boolean) => void;
  class?: string;
}
