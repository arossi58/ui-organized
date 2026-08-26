import { getContext, setContext } from "svelte";

/**
 * True for anything rendered inside a `<Menubar>`.
 *
 * A `role="menubar"` may only contain menuitems, so the menu triggers placed in
 * one have to say they are menuitems rather than buttons. A trigger cannot tell
 * where it sits on its own — `Menu` is an independent Ark machine that knows
 * nothing about the bar around it — so the bar announces itself here.
 *
 * A plain boolean rather than an accessor: a bar does not appear or disappear
 * around a trigger that is already mounted, so there is nothing to stay current
 * with.
 *
 * Its own module to keep `Menu` and `Menubar` from importing each other.
 */
const MENUBAR_KEY = Symbol("ui-organized.menubar");

/** Called by a `Menubar` during initialisation. */
export function setInMenubar(): void {
  setContext(MENUBAR_KEY, true);
}

/** Read by `MenuTrigger`. False for a menu rendered outside any bar. */
export function getInMenubar(): boolean {
  return getContext<boolean | undefined>(MENUBAR_KEY) ?? false;
}
