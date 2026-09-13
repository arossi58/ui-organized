import type { Snippet } from "svelte";

export interface AlertProps {
  /** Semantic variant driving icon and color. Defaults to 'info'. */
  variant?: "info" | "success" | "warning" | "error";
  /** Optional title text rendered above the message. */
  title?: string;
  /** The alert message content. */
  children: Snippet;
  /**
   * Called when the dismiss button is activated. Its *presence* renders the
   * button — omit it and there is none, exactly as in the React package.
   */
  onDismiss?: () => void;
  class?: string;
}
