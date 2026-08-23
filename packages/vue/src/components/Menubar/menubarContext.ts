import { inject, provide, type InjectionKey } from "vue";

/**
 * True for anything rendered inside a `<Menubar>`.
 *
 * A `role="menubar"` may only contain menuitems, so the menu triggers placed in
 * one have to say they are menuitems rather than buttons. A trigger cannot tell
 * where it sits on its own — `Menu` is an independent Ark machine that knows
 * nothing about the bar around it — so the bar announces itself here.
 *
 * A plain boolean rather than a ref: a bar does not appear or disappear around a
 * trigger that is already mounted, so there is nothing to stay current with.
 *
 * Its own module to keep `Menu` and `Menubar` from importing each other.
 */
const MENUBAR_KEY: InjectionKey<true> = Symbol("ui-organized.menubar");

export function provideMenubar(): void {
  provide(MENUBAR_KEY, true);
}

export function useInMenubar(): boolean {
  return inject(MENUBAR_KEY, false);
}
