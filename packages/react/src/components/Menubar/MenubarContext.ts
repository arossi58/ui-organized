import { createContext, useContext } from "react";

/**
 * True for anything rendered inside a `<Menubar>`.
 *
 * A `role="menubar"` may only contain menuitems, so the menu triggers placed in
 * one have to say they are menuitems rather than buttons. The trigger can't tell
 * where it sits on its own — `Menu` is an independent Ark machine that knows
 * nothing about the bar around it — so the bar announces itself here.
 *
 * Its own module to keep `Menu` and `Menubar` from importing each other.
 */
export const MenubarContext = createContext(false);

export const useInMenubar = () => useContext(MenubarContext);
