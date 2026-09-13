/**
 * Root of a single disclosure section. Controlled via `v-model:open` (or
 * `open` + `@open-change`), or uncontrolled via `defaultOpen`.
 */
export interface CollapsibleProps {
  /** Whether the panel is open. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Disable the trigger and prevent toggling. */
  disabled?: boolean;
}

export interface CollapsibleTriggerProps {
  /**
   * Render the slot's own root element as the trigger instead of a native
   * `<button>`, merging in the trigger's classes, ARIA and click handler.
   *
   * Ark UI's Vue convention — a boolean, where React takes an element through
   * `render` and Svelte takes a snippet through `asChild`. Same idea, third
   * spelling; see Button.types.ts for the longer note.
   */
  asChild?: boolean;
}

export interface CollapsibleContentProps {
  /** Project the panel onto the slot's own root element instead of a `<div>`. */
  asChild?: boolean;
}
