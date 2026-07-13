import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Accordion } from "@ui-organized/react";
import { ThemeControls } from "./ThemeControls";
import "./mobile-menu.css";

/** Mirrors the NavItem shape in SiteNav (one source of truth passed down). */
type NavItem = { label: string; to?: string; href?: string };

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavItem[];
  /** Index of the active route in `links`, or -1 when none matches. */
  activeIndex: number;
}

/**
 * The mobile primary navigation: a full-screen takeover that slides in *behind*
 * the nav pill from SiteNav — the pill (logo + hamburger, which becomes an X)
 * stays put on top, so opening/closing never shifts the logo or the button. It
 * holds the same routes as a large tap-friendly list, plus an accordion that
 * tucks away the theme controls (dark mode + brand colour, shared with the
 * desktop popover via ThemeControls).
 *
 * Kept mounted and toggled via the `mobile-menu--open` class so both the enter
 * and exit animations run from CSS. When closed it is inert — `aria-hidden`,
 * `visibility: hidden`, and no pointer events — so nothing inside is focusable.
 */
export function MobileMenu({ open, onClose, links, activeIndex }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock the page scroll and move focus into the panel while open; Escape
  // closes and Tab is trapped within the takeover (it's a modal dialog). The
  // hamburger/X toggle itself lives in SiteNav (on top of this panel).
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // Focus the first link once the panel is interactive.
    panelRef.current
      ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
      ?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the panel: wrap from last→first and first→last.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={`mobile-menu${open ? " mobile-menu--open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
    >
      {/* Scrolls as a unit under the nav pill so a fully-expanded Appearance
          accordion never gets clipped on short viewports. */}
      <div className="mobile-menu__scroll">
        <nav className="mobile-menu__nav" aria-label="Primary">
          {links.map((link, i) => {
            const active = i === activeIndex;
            const className = `mobile-menu__link${active ? " mobile-menu__link--active" : ""}`;
            return link.to !== undefined ? (
              <Link
                key={link.label}
                className={className}
                to={link.to}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
              >
                {link.label}
              </Link>
            ) : (
              <a key={link.label} className={className} href={link.href} onClick={onClose}>
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="mobile-menu__appearance">
          <Accordion
            items={[
              {
                value: "appearance",
                title: "Appearance",
                content: <ThemeControls />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
