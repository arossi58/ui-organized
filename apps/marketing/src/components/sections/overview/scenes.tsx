import { OverviewScene } from "./OverviewScene";
import { DesignArt } from "./DesignArt";
import { PluginsArt } from "./PluginsArt";
import { CodeArt } from "./CodeArt";

/**
 * Per-card scene arts — the Unicorn Studio WebGL animations that replace the
 * GSAP/SVG illustrations on the overview cards. Defined at module scope (stable
 * component identity) so a card re-render never remounts — and so re-initialises
 * — its WebGL context. Each binds a scene export to the matching SVG art, which
 * stays on as the load/no-WebGL fallback.
 */
export function DesignScene({ active }: { active: boolean }) {
  return <OverviewScene active={active} file="design-card" Fallback={DesignArt} />;
}

export function ToolsScene({ active }: { active: boolean }) {
  return <OverviewScene active={active} file="tools-card" Fallback={PluginsArt} />;
}

export function CodeScene({ active }: { active: boolean }) {
  return <OverviewScene active={active} file="code-card" Fallback={CodeArt} />;
}
