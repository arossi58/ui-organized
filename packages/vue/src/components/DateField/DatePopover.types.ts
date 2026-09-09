export interface DatePopoverProps {
  /** Optional container to teleport into (defaults to `body`). */
  container?: HTMLElement | null;
  /**
   * Accessible name for the popup. Ark gives the content `role="dialog"`, and a
   * dialog needs a name — the calendar inside is not one, it's the content.
   * Pass the same phrase the trigger uses ("Choose date").
   */
  label: string;
}
