export interface AlertProps {
  /** Semantic variant driving icon and color. Defaults to 'info'. */
  variant?: "info" | "success" | "warning" | "error";
  /** Optional title text rendered above the message. */
  title?: string;
  /**
   * Called when the dismiss button is activated. Its *presence* renders the
   * button — omit it and there is none.
   *
   * A callback prop rather than an emit, and that is the whole point: Vue can
   * ask "did anyone pass this?" and an emit cannot. `defineEmits` strips
   * `onDismiss` out of `$attrs`, so a component that declared `dismiss` as an
   * emit has no way to find out whether it is listened to — which is exactly why
   * the Angular library had to take an explicit `dismissible` input instead.
   * React and Svelte both key the button off the callback's presence; declaring
   * it as a prop is what lets Vue match them.
   *
   * Both spellings reach it, because a declared prop wins over an emit listener
   * during prop resolution: `@dismiss="hide"` and `:on-dismiss="hide"` are the
   * same thing here. Pinned by a test — see Alert.test.ts.
   */
  onDismiss?: () => void;
}
