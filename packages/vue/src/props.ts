/**
 * Passing "nothing" in Vue.
 *
 * React and Svelte both treat an explicit `undefined` as "I am not setting
 * this": zag's `mergeProps` keeps the machine's value, and the renderer omits
 * the attribute. Vue does neither.
 *
 * - For an **attribute**, `:aria-labelledby="undefined"` *removes* the attribute
 *   Ark just computed. The merge is last-wins and not undefined-aware.
 * - For a **declared prop**, `undefined` triggers that prop's declared default.
 *   Ark's `Switch.Root` declares `checked` with a default of `false`, so passing
 *   `undefined` actively unchecks a switch that `defaultChecked` had checked.
 *
 * - For a **declared Boolean prop**, an *absent* value is cast to `false`, not
 *   `undefined` — unless the prop declares a default. This is why every
 *   `defineModel<boolean>` in this package passes `{ default: undefined }`:
 *   without it an uncontrolled component silently becomes a controlled-off one.
 *
 * All three are silent, and all three only show up in the case where the value
 * mattered. The only way to leave something alone in Vue is not to pass it, so
 * components build an object and spread it.
 *
 * Note the limit: this helper cannot rescue a Boolean prop that Vue has already
 * cast to `false`, because by then the information that it was absent is gone.
 * That has to be fixed at the declaration.
 *
 * ```vue
 * <ArkSwitch.Root v-bind="definedOnly({ checked, name, id })" />
 * ```
 */
export function definedOnly<T extends Record<string, unknown>>(props: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) out[key] = value;
  }
  return out as Partial<T>;
}
