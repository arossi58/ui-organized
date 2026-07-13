import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { ThemeMenu } from "./ThemeMenu";
import { MobileMenu } from "./MobileMenu";
import { useNavIndicator } from "../../hooks/useNavIndicator";
import "./site-nav.css";

interface SiteNavProps {
  /**
   * `overlay` (default) floats the nav over the hero's pinned stage; `solid`
   * makes it a normal in-flow header.
   */
  variant?: "overlay" | "solid";
}

/**
 * Primary nav items. `to` items are in-site routes (React Router, so the nav
 * persists across them); `href` items point at sibling apps / placeholders.
 * "Docs" is the white-labeled Storybook embedded in the /docs route; "Tools" the
 * design-system tool gallery at /tools (which now hosts the theme builder too).
 */
type NavItem = { label: string; to?: string; href?: string };
const NAV_LINKS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Docs", to: "/docs" },
  { label: "Tools", to: "/tools" },
  { label: "About", to: "/about" },
];

/**
 * The floating pill nav from the Branding mockup: logomark on the left, the
 * link row with the active route shown as a brand pill, and the theme menu
 * (brand colour + dark mode) on the right.
 */
export function SiteNav({ variant = "overlay" }: SiteNavProps) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Index of the active tab: exact route or any sub-route (e.g. /tools matches
  // /tools/color-palette); "/" is exact-match only. Any external `href` items
  // (none currently) have no `to`, so they can never be active. -1 ⇒ no pill.
  const activeIndex = NAV_LINKS.findIndex(
    (link) =>
      link.to !== undefined &&
      (pathname === link.to ||
        (link.to !== "/" && pathname.startsWith(`${link.to}/`))),
  );

  const { containerRef, pillRef, setLinkRef } = useNavIndicator(activeIndex);

  // Close the mobile menu on any route change (a link inside it navigated) and
  // return focus to the hamburger so keyboard users aren't stranded.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function closeMenu() {
    setMenuOpen(false);
    hamburgerRef.current?.focus();
  }

  return (
    <header className={`site-nav site-nav--${variant}`}>
      <div className="site-nav__pill">
        <Link className="site-nav__brand" to="/" aria-label="UI Organized — home">
          <BrandMark glyphOnly />
        </Link>

        <nav className="site-nav__links" aria-label="Primary" ref={containerRef}>
          {/* The selected pill: a single brand-filled element sitting behind the
              labels that slides + resizes to the active tab. Driven imperatively
              by useNavIndicator so it animates across route changes. */}
          <span className="site-nav__indicator" aria-hidden="true" ref={pillRef} />

          {NAV_LINKS.map((link, i) => {
            const active = i === activeIndex;
            const className = `site-nav__link${active ? " site-nav__link--active" : ""}`;
            return link.to !== undefined ? (
              <Link
                key={link.label}
                ref={setLinkRef(i)}
                className={className}
                to={link.to}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                ref={setLinkRef(i)}
                className={className}
                href={link.href}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="site-nav__theme">
          <ThemeMenu />
        </div>

        {/* Mobile: the theme menu + link row are hidden by CSS ≤720px; this
            hamburger toggles the full-screen MobileMenu, which slides in behind
            the pill. The button stays put — only its icon swaps to an X — so the
            logo and control never jump when the menu opens or closes. */}
        <button
          type="button"
          ref={hamburgerRef}
          className="site-nav__hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-haspopup="dialog"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        links={NAV_LINKS}
        activeIndex={activeIndex}
      />
    </header>
  );
}
