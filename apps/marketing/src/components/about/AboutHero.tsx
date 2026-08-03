import { Reveal } from "../Reveal";
import "../gradient/dot-grid.css";
import "./about.css";

/**
 * About — the whole page, deliberately. One raised panel on the flat cream + dot
 * lattice the other in-flow routes sit on: the heading, the background, the why,
 * and a footnote. This is the one page where the site's "we" becomes an "I", so
 * it gets a single essay measure rather than the section rhythm the rest of the
 * site uses.
 */
export function AboutHero() {
  return (
    <section className="section about-hero">
      {/* Decorative lattice, behind the copy. */}
      <div className="about-hero__dots dot-grid" aria-hidden="true" />

      <div className="wrap about-hero__inner">
        <Reveal>
          <div className="about-hero__panel">
            <h1 className="about-hero__title">
              There is no reason to not have a design system
            </h1>

            <div className="about-hero__body">
              <p className="about-prose">
                UI Organized started as my own kit. A design system and a
                handful of tools I built to fit how I worked day to day, because
                the same things kept breaking in the handoff between design and
                code, and fixing them once seemed better than working around them
                forever. It grew into my master&rsquo;s capstone, and then it kept
                going past it. Everything since came out of the same place: a
                component library, a Figma library, and the tools between them. A
                color system that builds a full accessible palette from a single
                brand color. A token manager. A Code Connect pipeline that keeps
                the canvas and the codebase pointed at the same thing.
              </p>
              <p className="about-prose">
                It&rsquo;s free because access is the part nobody accounts for.
                Design quality isn&rsquo;t only a matter of talent. It&rsquo;s a
                matter of what the people building a thing could get their hands
                on, and every experience anyone ships is capped by that. A Figma
                file, a repo, a plugin that saves an afternoon: when the good
                stuff sits behind a paywall, the cost doesn&rsquo;t stop at the
                team that couldn&rsquo;t pay it. It lands on whoever uses what
                they shipped instead. We&rsquo;re a rare collective of people
                trained in empathy and service. If we mean that, we owe it to
                each other. So: Apache-2.0, all of it. Use it, fork it, ship
                something better than I would have.
              </p>

              <p className="about-hero__note">
                An ongoing project by{" "}
                <a href="https://arossi.design/" target="_blank" rel="noreferrer">
                  Andrew Rossi
                </a>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
