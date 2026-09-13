import type { Snippet } from "svelte";

export interface DatePopoverProps {
  /** Optional container for the portal (defaults to `document.body`). */
  container?: HTMLElement | null;
  /**
   * Accessible name for the popup. Ark gives the content `role="dialog"`, and a
   * dialog needs a name — the calendar inside is not one, it's the content.
   * Pass the same phrase the trigger uses ("Choose date").
   */
  label: string;
  children?: Snippet;
}
