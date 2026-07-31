/**
 * The stage a live component renders into.
 *
 * Three responsibilities beyond framing:
 *
 * 1. **`IconProvider`.** Storybook wraps every story in
 *    `<IconProvider library="lucide" style="outline" strokeAdjustment>`
 *    (`.storybook/preview.tsx`), and the stories assume it — without the same
 *    wrapper here every `icon="…"` prop renders nothing.
 * 2. **An error boundary.** These pages render 45 components' worth of real
 *    story code. One story that throws would otherwise blank the entire route,
 *    so a failure is contained to its own preview and reported in place.
 * 3. **A scan target.** `stageRef` exposes just the rendered component — not the
 *    frame or toolbar — for the accessibility checker and the vision filters.
 * 4. **Overlay containment**, opt-in via `containOverlays`. A Dialog that
 *    portals to `<body>` and covers the window is right in an app and useless in
 *    a docs panel: it hides the inspector describing it, and it renders outside
 *    `stageRef`, so the element tree and the axe run never see it. Contained, it
 *    renders in place inside the stage and every one of those follows.
 */
import { Component, type ReactNode, type Ref } from "react";
import { IconProvider } from "@ui-organized/react";
import { PreviewOverlayProvider } from "@ui-organized/react/preview";
import type { PreviewLayout } from "../registry";
import styles from "./preview.module.css";

class PreviewBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.error} role="alert">
          <p className={styles.errorTitle}>“{this.props.label}” failed to render.</p>
          <pre className={styles.errorDetail}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface PreviewSurfaceProps {
  children: ReactNode;
  /** From the story's `parameters.layout`. */
  layout?: PreviewLayout;
  /** Controls above the stage — vision filter picker, reset, a11y toggle. */
  toolbar?: ReactNode;
  /** The rendered component only, for axe scans and vision filters. */
  stageRef?: Ref<HTMLDivElement>;
  /** A CSS `filter` value, e.g. `url(#docs-vision-protanopia)`. */
  visionFilter?: string;
  /** Named in the error message when a story throws. */
  label?: string;
  /**
   * Rendered inside the frame, below the stage — for a code block that belongs
   * to this preview rather than sitting near it. Sharing one frame is what makes
   * the snippet read as "the code for *this*" instead of a separate section a
   * reader has to associate by proximity.
   */
  footer?: ReactNode;
  /**
   * Render overlays (Dialog, Menu, Select's listbox, Toast…) inside this frame
   * rather than over the window. The Inspect view sets it; the Docs tab doesn't,
   * so its examples keep behaving the way they would in an application.
   */
  containOverlays?: boolean;
}

export function PreviewSurface({
  children,
  layout = "padded",
  toolbar,
  stageRef,
  visionFilter,
  label = "This preview",
  footer,
  containOverlays = false,
}: PreviewSurfaceProps) {
  return (
    <div className={styles.surface} data-contain-overlays={containOverlays || undefined}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      {/* The vision filter goes on the outer stage so it covers the padded
          area, but `stageRef` — the axe target and the inspection root — goes on
          the inner wrapper. Pointing them at the same element would put this
          layout `div` at the top of the element tree, so the inspector would
          open on docs-site scaffolding instead of the component. */}
      <div
        className={styles.stage}
        data-layout={layout}
        style={visionFilter ? { filter: visionFilter } : undefined}
      >
        <div className={styles.stageInner} ref={stageRef}>
          <PreviewBoundary label={label}>
            <IconProvider library="lucide" style="outline" strokeAdjustment>
              {/* Inside `stageRef`, so a contained overlay lands in the subtree
                  the inspector and the axe run already scan. */}
              <PreviewOverlayProvider contain={containOverlays}>{children}</PreviewOverlayProvider>
            </IconProvider>
          </PreviewBoundary>
        </div>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
