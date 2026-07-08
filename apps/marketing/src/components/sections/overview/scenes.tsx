import { OverviewVideoScene } from "./OverviewVideoScene";

/**
 * Per-card scene arts — the WebM UI animations that replace the earlier
 * WebGL/GSAP illustrations on the overview cards. Each binds a card to its clip
 * under public/card-animations/. They receive the card's `selected`
 * (detail-panel open) state and play once on selection; see OverviewVideoScene
 * for the one-shot / replay-on-reselect behaviour.
 */
export function DesignScene({ selected }: { selected: boolean }) {
  return <OverviewVideoScene selected={selected} file="design" />;
}

export function ToolsScene({ selected }: { selected: boolean }) {
  return <OverviewVideoScene selected={selected} file="plugins-tools" />;
}

export function CodeScene({ selected }: { selected: boolean }) {
  return <OverviewVideoScene selected={selected} file="code" />;
}
