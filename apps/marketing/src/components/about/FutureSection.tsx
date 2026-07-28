import { Reveal } from "../Reveal";
import { ButtonLink } from "../chrome/ButtonLink";
import "./about.css";

/**
 * The "what's next" — the roadmap and the invitation to join it. Sends people to
 * the live board on the home page rather than rendering a second copy of it.
 *
 * That link is a plain href, not a router <Link>: React Router doesn't scroll to
 * a hash on navigation and this app has no ScrollRestoration, so a
 * <Link to="/#roadmap"> would land at the top of home. A real anchor lets the
 * browser do it. BASE_URL is always trailing-slashed, so this resolves under a
 * deploy base prefix too.
 */
const HOME = import.meta.env.BASE_URL;

export function FutureSection() {
  return (
    <section className="section about-future">
      <div className="wrap">
        <Reveal>
          <div className="about-future__inner">
            <h2 className="section-title">Built in the open, one card at a time.</h2>

            <p className="about-prose">
              Everything planned lives on a public board. More components and a
              cleaner Figma library first. Then data visualization, a table
              library, and support for frameworks past React. I work through it in
              the open, so you can see what&rsquo;s coming, or take something on.
            </p>
            <p className="about-prose">
              The real goal is people. One person maintaining a design system is a
              project. A community maintaining it is infrastructure. If you
              design, build, or just have opinions about how this should work,
              there&rsquo;s room for you.
            </p>

            <div className="about-future__actions">
              <ButtonLink href={`${HOME}#roadmap`} intent="primary" size="md">
                See what&rsquo;s in progress
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
