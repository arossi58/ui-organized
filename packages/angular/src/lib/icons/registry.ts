import type { Type } from "@angular/core";
import {
  createIconRegistry,
  type IconNameMap as CoreIconNameMap,
  type IconSet as CoreIconSet,
} from "@ui-organized/core";

export type { IconLibrary } from "@ui-organized/core";

/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to Angular component types.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the component type, and choosing a key distinct from the other three
 * packages' so none of them can read another's components.
 *
 * ── Two open questions, and why `Icon` is not here yet ──────────────────────
 *
 * **What an Angular icon *is*.** Typed as a component here, to match the other
 * three. But Angular instantiates a component onto an element of its own, so
 * `<span class="icon"><lucide-icon><svg/></lucide-icon></span>` is one element
 * deeper than the `<span class="icon"><svg/></span>` the other libraries render
 * — against a stylesheet that lays `.icon` out in a flex row. Reaching the same
 * DOM means either icon components authored as `svg[…]` and mounted onto an
 * element `Icon` creates, or an icon set that stores SVG data rather than
 * components. Core's registry is generic over the component type precisely so a
 * framework can answer this differently, but the answer changes what an adapter
 * looks like, so it is a decision rather than a detail.
 *
 * **Whether adapters may ship at all.** The other libraries have
 * `@ui-organized/<framework>/icons/lucide` and friends, importing an icon
 * library as an optional peer. Doing the same here runs into the constraint that
 * nothing third-party comes in behind the CDK — optional peers are arguably a
 * different category, but that is the user's call to make.
 *
 * Until both are settled a consumer registers their own set, which the registry
 * has always supported:
 *
 * ```ts
 * registerIconSet({ library: "lucide", outline: { check: CheckIcon }, svgProps: … });
 * ```
 */
export type IconComponent = Type<unknown>;
export type IconNameMap = CoreIconNameMap<IconComponent>;
export type IconSet = CoreIconSet<IconComponent>;

const { registerIconSet, getIconSet, registeredLibraries } = createIconRegistry<IconComponent>(
  Symbol.for("@ui-organized/angular.iconRegistry"),
);

export { registerIconSet, getIconSet, registeredLibraries };
