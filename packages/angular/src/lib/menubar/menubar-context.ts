import { Injectable } from "@angular/core";

/**
 * Announces that everything below it is inside a `<div uioMenubar>`.
 *
 * A `role="menubar"` may only contain menuitems, so the menu triggers placed in
 * one have to say they are menuitems rather than buttons. A trigger cannot tell
 * where it sits on its own — `UioMenu` is an independent overlay that knows
 * nothing about the bar around it — so the bar provides this and the trigger
 * injects it optionally.
 *
 * Empty on purpose: the *presence* of the provider is the whole signal, and
 * there is no state to keep current. A bar does not appear or disappear around a
 * trigger that is already mounted.
 *
 * Its own module so that `menu.ts` and `menubar.ts` do not import each other —
 * the same split React makes with `MenubarContext.ts`, for the same reason.
 */
@Injectable()
export class UioMenubarContext {}
