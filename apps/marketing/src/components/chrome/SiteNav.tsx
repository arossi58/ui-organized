import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { ThemeMenu } from "./ThemeMenu";
import { LINKS } from "../../lib/links";
import "./site-nav.css";

interface SiteNavProps {
  /**
   * `overlay` (default) floats the nav over the hero's pinned stage; `solid`
   * makes it a normal in-flow header.
   */
  variant?: "overlay" | "solid";
}

/** Primary nav items (Branding mockup). Home is the active page; the rest are
 * placeholders until those destinations land. */
const NAV_LINKS: Array<{ label: string; href: string; active?: boolean }> = [
  { label: "Home", href: "/", active: true },
  { label: "Design", href: "#" },
  { label: "Plugins", href: "#" },
  { label: "Builder", href: LINKS.builder },
];

/**
 * The floating pill nav from the Branding mockup: logomark on the left, the
 * link row with the active item as a brand pill, and the theme menu (brand
 * colour + dark mode) on the right.
 */
export function SiteNav({ variant = "overlay" }: SiteNavProps) {
  return (
    <header className={`site-nav site-nav--${variant}`}>
      <div className="site-nav__pill">
        <Link className="site-nav__brand" to="/" aria-label="UI Organized — home">
          <BrandMark glyphOnly />
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              className={`site-nav__link${link.active ? " site-nav__link--active" : ""}`}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-nav__theme">
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}
