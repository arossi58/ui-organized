import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import "./site-footer.css";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="site-footer__brand" to="/" aria-label="UI Organized — home">
        <BrandMark />
      </Link>
      <nav className="site-footer__legal" aria-label="Legal">
        <Link className="site-footer__link" to="/privacy">
          Privacy
        </Link>
        <Link className="site-footer__link" to="/terms">
          Terms
        </Link>
        <Link className="site-footer__link" to="/cookies">
          Cookies
        </Link>
      </nav>
      <span className="site-footer__note">Open source · MIT license</span>
    </footer>
  );
}
