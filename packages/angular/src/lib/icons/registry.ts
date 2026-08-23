import {
  createIconRegistry,
  type IconNameMap as CoreIconNameMap,
  type IconSet as CoreIconSet,
} from "@ui-organized/core";

export type { IconLibrary } from "@ui-organized/core";

/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to **SVG markup** rather than to components.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the stored type, and choosing a key distinct from the other three
 * packages' so none of them can read another's icons.
 *
 * ── Why an Angular icon is a string ─────────────────────────────────────────
 *
 * The other three libraries store components, and Angular could too — but
 * Angular instantiates a component onto an element of its own, so an icon
 * rendered that way comes out as
 * `<span class="icon"><ng-icon><svg/></ng-icon></span>` where the others render
 * `<span class="icon"><svg/></span>`. `.icon` is `display: inline-flex` with
 * centring, so the intermediate element becomes the flex item and the SVG stops
 * being what is laid out. One element deeper is a different DOM, and this whole
 * package exists to produce the same one.
 *
 * Core's registry is generic over the stored type precisely so a framework can
 * answer this differently. Storing markup lets `Icon` create the `<svg>` itself
 * and put it directly inside the span.
 *
 * It also turns out to be the *better* contract for stroke. Every
 * `@ng-icons/*` pack ships its icons with
 * `style="stroke-width:var(--ng-icon__stroke-width, 2)"`, so a single custom
 * property drives the weight for lucide, tabler and heroicons alike — where the
 * React adapters need three different prop shapes because lucide takes
 * `strokeWidth`, tabler takes `stroke` and heroicons takes `width`/`height`.
 */
export type IconMarkup = string;
export type IconNameMap = CoreIconNameMap<IconMarkup>;
export type IconSet = CoreIconSet<IconMarkup>;

const { registerIconSet, getIconSet, registeredLibraries } = createIconRegistry<IconMarkup>(
  Symbol.for("@ui-organized/angular.iconRegistry"),
);

export { registerIconSet, getIconSet, registeredLibraries };
