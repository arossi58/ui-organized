import { Reveal } from "../Reveal";
import "../gradient/dot-grid.css";
import "./about.css";

/**
 * About hero — the page's opening statement, on the same flat cream + dot
 * lattice the other in-flow routes sit on. Sets the first-person voice the rest
 * of the page keeps: this is the one page where the site's "we" becomes an "I".
 */
export function AboutHero() {
  return (
    <section className="section about-hero">
      {/* Decorative lattice, behind the copy. */}
      <div className="about-hero__dots dot-grid" aria-hidden="true" />

      <div className="wrap about-hero__inner">
        <Reveal>
          <h1 className="about-hero__title">
            I built the design system I kept wishing for.
          </h1>
          <p className="about-hero__lede">
            It started as a capstone. It didn&rsquo;t stay one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
