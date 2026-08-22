/**
 * Dropping an ARIA attribute that a headless machine supplied.
 *
 * Ark parts merge their machine props with ours through zag's `mergeProps`,
 * which treats `undefined` as "the caller didn't set this" and keeps the
 * machine's value:
 *
 * ```js
 * result[key] = props[key] !== undefined ? props[key] : result[key]
 * ```
 *
 * `null` passes that test, and React omits an attribute whose value is `null`.
 * So `null` — not `undefined` — is how a facade sheds an attribute the machine
 * emitted, and this constant is what lets it be spelled against React's
 * `string | undefined` ARIA prop types.
 *
 * Used where a machine points at a part we don't render: an unlabelled control
 * whose `aria-labelledby` would dangle, or a closed popup trigger whose
 * `aria-controls` names content that isn't mounted. A dangling IDREF is an ARIA
 * error (axe's `aria-valid-attr-value`) and it costs the control its accessible
 * name, because the reference wins over any `aria-label` beside it.
 *
 * This lives here because the *reason* it works is zag's `mergeProps`, which is
 * shared by every Ark framework package — but the *other* half is the renderer
 * dropping a `null` attribute, which is a per-framework guarantee. React does.
 * Vue and Svelte 5 are believed to, and Angular's host bindings are a different
 * mechanism entirely. Each framework library must assert this with axe before
 * relying on it: the failure is silent, and it costs a control its accessible
 * name rather than throwing.
 */
export const OMIT_ARIA = null as unknown as undefined;

/**
 * `aria-controls` for a popup trigger, dropped while the popup is closed.
 *
 * Ark keeps the attribute on the trigger at all times, but the content it names
 * is only mounted while the popup is open, so the reference resolves to nothing
 * the rest of the time. In that state `aria-haspopup` and `aria-expanded`
 * already say everything a screen reader needs; the id is worth pointing at
 * only once there is something at the other end of it.
 *
 * Spread before `{...props}` so a caller-supplied `aria-controls` still wins.
 */
export function popupControls(open: boolean) {
  return { "aria-controls": open ? undefined : OMIT_ARIA };
}
