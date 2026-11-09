<!--
  Foundational Icon component — the single interface for rendering icons.

  Reads the active library, style, and stroke adjustment from the nearest
  `IconProvider`, looks the name up among the icons registered for that library,
  and renders it at the requested size with optical stroke correction when
  enabled. Names are the library's own (`x` in Lucide). Every decision it makes before rendering is shared with the other
  framework libraries; see `resolveIcon*` in @ui-organized/core.

  Only the icons you register reach the bundle — see `../../icons/registry.ts`
  for why the package deliberately imports none of the icon libraries itself:

      import { registerIcons } from "@ui-organized/svelte/icons/lucide";
      registerIcons({ Camera, Rocket });   // <Icon name="camera" />

  Components never import from an icon library directly — they always go through
  this component.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    resolveIconStroke,
    resolveIconSvgProps,
    resolveSystemGlyph,
  } from "@ui-organized/core";
  import { getIconConfig } from "../../context/iconContext.svelte.js";
  import { glyphOf } from "../../icons/glyph.js";
  import {
    getIcon,
    getIconSet,
    registeredLibraries,
    registeredNames,
    type IconSet,
  } from "../../icons/registry.js";
  import { warnMissingIcon, warnMissingIconSet } from "./warnMissingIconSet.js";
  import type { IconProps } from "./Icon.types.js";
  import "@ui-organized/core/components/Icon/Icon.css";

  let { name, size = 24, label, class: className }: IconProps = $props();

  const config = $derived(getIconConfig());

  // A directly-supplied component is used as-is — it needs no registration and
  // no registered set. The exception is one of the components' own glyphs,
  // which stands in for whichever cut the active library has.
  const glyph = $derived(typeof name === "string" ? undefined : glyphOf(name));
  const supplied = $derived(typeof name === "string" || glyph ? undefined : name);

  // An explicit `icons` on the provider wins; otherwise use whatever the
  // imported subpath registered.
  const set = $derived<IconSet | undefined>(
    supplied ? undefined : (config.icons ?? getIconSet(config.library)),
  );

  const missing = $derived(!supplied && !set);
  $effect(() => {
    // The one failure this structure can introduce: upgrading without adding the
    // subpath import renders nothing at all. Silence would be indefensible, so
    // say exactly what to add. Once per library.
    if (missing) warnMissingIconSet(config.library, registeredLibraries());
  });

  const IconComponent = $derived(
    supplied ??
      (!set
        ? undefined
        : glyph
          ? resolveSystemGlyph(set, glyph, config.style)
          : getIcon(set.library, name as string, config.style)),
  );

  $effect(() => {
    if (set && !IconComponent && typeof name === "string") {
      warnMissingIcon(set.library, name, registeredNames(set.library));
    }
  });

  const svgProps = $derived(
    resolveIconSvgProps(
      set,
      size,
      resolveIconStroke({
        style: config.style,
        strokeAdjustment: config.strokeAdjustment,
        size,
        baseStroke: config.baseStroke,
        baseSize: config.baseSize,
      }),
    ),
  );
</script>

{#if IconComponent}
  <span
    class={clsx("icon", className)}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    role={label ? "img" : undefined}
  >
    <IconComponent {...svgProps} />
  </span>
{/if}
