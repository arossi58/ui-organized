/**
 * The compact docs nav: a sticky bar carrying the trigger, and the left sheet it
 * opens.
 *
 * The trigger is the design system's own `Button` — secondary, icon-only — and
 * deliberately unlike the site's hamburger, which is a circular button riding in
 * the floating nav pill. The docs nav is a second, subordinate navigation
 * surface, and it should read that way rather than competing with the site nav
 * for the same affordance.
 */
import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger } from "@ui-organized/react";
import { PanelLeft } from "lucide-react";
import { DocsNav } from "./DocsNav";
import styles from "./layout.module.css";

interface DocsNavSheetProps {
  /**
   * Where the sheet portals to. Passed down from the route so the panel lands
   * inside `.docs-page`'s stacking context and therefore *under* the site nav
   * pill — the site nav stays the primary navigation, visible and one tap away.
   * Defaults to `document.body` (i.e. over the pill) if absent.
   */
  container?: RefObject<HTMLElement | null>;
}

export function DocsNavSheet({ container }: DocsNavSheetProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  /**
   * Pin the sheet to the docs page rather than the window.
   *
   * The panel and its scrim are `position: fixed`, so left alone they cover the
   * whole viewport — including the site nav above the docs. Measuring how much
   * of the nav is still on screen and offsetting both by it keeps the drawer
   * within the page it belongs to. Between 721 and 900 the site chrome is
   * pinned, so the nav is always there; on a phone it's in flow and may have
   * scrolled away already, in which case the docs *are* the whole viewport and
   * the offset is zero.
   *
   * Written to the portal host, not the panel: the scrim is the panel's sibling
   * and has to start on the same line, so the custom property has to live on
   * something they both inherit from. Measured on the trigger's click rather
   * than in an effect, because opening locks body scroll and this has to be the
   * geometry from before that ran.
   */
  const measureNav = () => {
    const host = container?.current;
    if (!host) return;
    const nav = document.querySelector(".site-nav");
    const clearance = nav ? Math.max(0, Math.round(nav.getBoundingClientRect().bottom)) : 0;
    host.style.setProperty("--docs-sheet-nav-clearance", `${clearance}px`);
  };

  // Mirrors SiteNav's own close-on-navigate: a row inside the sheet closes it
  // through `onNavigate`, and this catches everything else that changes the
  // route — in-page links, the back button. Ark restores focus to the trigger.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Ark's dialog root renders no element of its own, so `.bar` is still a
          direct grid child of `.root` and can be the sticky first row.

          A landmark, and the same name the rail carries on a wide viewport:
          this *is* the docs navigation down here. The two never collide in the
          a11y tree — while the sheet is open Ark hides everything outside it,
          and while it's closed the panel is `visibility: hidden`. */}
      <nav className={styles.bar} aria-label="Documentation">
        <SheetTrigger
          onClick={measureNav}
          render={<Button intent="secondary" icon={PanelLeft} aria-label="Docs menu" />}
        />
      </nav>

      <SheetContent side="left" size="sm" container={container} className={styles.navSheet}>
        {/* Names the dialog for screen readers (Ark wires `aria-labelledby`),
            and its inherited right padding clears the close ×. */}
        <SheetTitle className={styles.navSheetTitle}>Documentation</SheetTitle>
        <DocsNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
