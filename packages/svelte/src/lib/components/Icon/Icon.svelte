<!--
  Foundational Icon component — the single interface for rendering icons.

  Reads the active library, style, and stroke adjustment from the nearest
  `IconProvider`, resolves the canonical name against that library's registered
  set, and renders it at the requested size with optical stroke correction when
  enabled. Every decision it makes before rendering is shared with the other
  framework libraries; see `resolveIcon*` in @ui-organized/core.

  The set has to be registered by importing its subpath — see
  `../../icons/registry.ts` for why the package deliberately imports none of the
  icon libraries itself:

      import "@ui-organized/svelte/icons/lucide";

  Components never import from an icon library directly — they always go through
  this component.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    resolveIconComponent,
    resolveIconStroke,
    resolveIconSvgProps,
  } from "@ui-organized/core";
  import type { CanonicalIconName } from "@ui-organized/utils";
  import { getIconConfig } from "../../context/iconContext.svelte.js";
  import { getIconSet, registeredLibraries, type IconSet } from "../../icons/registry.js";
  import { warnMissingIconSet } from "./warnMissingIconSet.js";
  import type { IconProps } from "./Icon.types.js";
  import "@ui-organized/core/components/Icon/Icon.css";

  let { name, size = 24, label, class: className }: IconProps = $props();

  const config = $derived(getIconConfig());

  // A directly-supplied component is used as-is — it keeps tree-shaking, needs
  // no canonical name, and needs no registered set.
  const supplied = $derived(typeof name === "string" ? undefined : name);

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
    supplied ?? resolveIconComponent(set, name as CanonicalIconName, config.style),
  );

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
