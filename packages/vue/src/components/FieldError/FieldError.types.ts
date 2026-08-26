export interface FieldErrorProps {
  /**
   * Message as a plain string.
   *
   * React accepts children as a string and tests it for emptiness before
   * rendering. Vue's slots are opaque the way Svelte's snippets are, so the
   * string arrives as a prop for that check to survive.
   */
  message?: string;
}
