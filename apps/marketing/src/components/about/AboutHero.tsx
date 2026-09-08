import { Reveal } from "../Reveal";
import "../gradient/dot-grid.css";
import "./about.css";

/**
 * About — the whole page, deliberately. One raised panel on the flat cream + dot
 * lattice the other in-flow routes sit on: the heading, three paragraphs, and a
 * signature. This is the one page where the site's "we" becomes an "I", so it
 * gets a single essay measure rather than the section rhythm the rest of the
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
            <h1 className="about-hero__title">The accessibility of design</h1>

            <div className="about-hero__body">
              <p className="about-prose">
                UI Organized started as my own toolkit. A design system and a
                handful of tools I built to fit how I worked day to day, because
                I kept encountering the same challenges. It grew into my
                master&rsquo;s capstone, and then it kept going past it. I wanted
                an easy to use design system for designers and developers, to
                bring them closer together and allow teams to grow beyond what UI
                Organized provides out of the box.
              </p>
              <p className="about-prose">
                We often talk about accessibility in design, and how we serve
                users with diverse abilities. Yet we often don&rsquo;t consider
                the accessibility of the craft itself. Design quality and
                timelines are influenced by what tools, techniques, and knowledge
                teams have at their disposal. A Figma file, a repo, a plugin that
                saves a few minutes or an entire afternoon: when the good stuff
                sits behind a paywall, the cost doesn&rsquo;t stop at the team
                that couldn&rsquo;t pay it. It lands on the user and what they
                received instead.
              </p>
              <p className="about-prose">
                We&rsquo;re a rare collective of people trained in empathy and
                service. If we mean that, we owe it to each other. Use it, fork
                it, build great experiences.
              </p>

              <p className="about-hero__sign">
                -{" "}
                <a href="https://arossi.design/" target="_blank" rel="noreferrer">
                  Andrew Rossi
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
