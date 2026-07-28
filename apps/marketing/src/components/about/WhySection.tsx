import { Card, CardBody } from "@ui-organized/react";
import { Reveal } from "../Reveal";
import "./about.css";

interface Reason {
  title: string;
  body: string;
}

const REASONS: Reason[] = [
  {
    title: "No reason to say no",
    body: "Teams don't skip design systems because they dislike design. They skip them over setup cost, upkeep, and a handoff that drifts the moment someone edits a file. Those are the reasons to say no. I'm taking them away one at a time.",
  },
  {
    title: "Design, democratized",
    body: "Good design shouldn't need a team, a budget, or ten years of practice. One brand color should get you a whole system: accessible, coherent, light and dark, canvas and code. That's not a shortcut. It's what the tools should have been doing all along.",
  },
  {
    title: "Giving back, as a designer",
    body: "Open source runs on what people give away, and most of what they give is code. I'm a designer. So this is my version: a component library, a Figma library, and the tools in between. Apache-2.0. Free. Yours.",
  },
];

/**
 * The "why" — the three reasons the project exists, as a card trio. Follows the
 * card recipe the site already uses for feature rows (accent bar, hover lift,
 * staggered reveal); the copy is the motivation, not the feature set.
 */
export function WhySection() {
  return (
    <section className="section about-why">
      <div className="wrap">
        <Reveal>
          <h2 className="section-title">Three reasons I keep going.</h2>
          <p className="section-sub">
            What kept going wrong, and what I&rsquo;m doing about it.
          </p>
        </Reveal>

        <div className="about-why__grid">
          {REASONS.map((reason) => (
            <Reveal key={reason.title} className="about-why__cell">
              <Card padding="lg" className="about-why__card">
                <CardBody>
                  <h3 className="about-why__title">{reason.title}</h3>
                  <p className="about-why__body">{reason.body}</p>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
