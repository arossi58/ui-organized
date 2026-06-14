import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import "./site-footer.css";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="site-footer__brand" to="/" aria-label="UI Organized — home">
        <BrandMark />
      </Link>
      <span className="site-footer__note">Open source · MIT license</span>
    </footer>
  );
}
