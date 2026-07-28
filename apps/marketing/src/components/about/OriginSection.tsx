import { Reveal } from "../Reveal";
import "./about.css";

/**
 * The "how" — where the project came from. Kept to a narrow measure so it reads
 * as an essay rather than a marketing slab; the section rhythm still comes from
 * the shared `.section` / `.wrap` primitives.
 */
export function OriginSection() {
  return (
    <section className="section about-origin">
      <div className="wrap">
        <Reveal>
          <div className="about-origin__inner">
            <h2 className="section-title">A capstone that kept going.</h2>

            <p className="about-prose">
              UI Organized was my capstone. A scope, a deadline, a thing to hand
              in. I handed it in. Then I kept building.
            </p>
            <p className="about-prose">
              What was meant to show what a design system <em>could</em> be turned
              into one I actually wanted to use. Then one I wanted other people to
              use. It&rsquo;s still a passion project. I build it in the open, on
              my own time.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
