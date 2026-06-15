import { Card, CardBody } from "@ui-organized/react";
import { Reveal } from "../Reveal";
import "./feature-trio.css";

interface Feature {
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    title: "Theme builder",
    body: "One brand color and a curated neutral become a full palette, type scale, and spacing system — light and dark included.",
  },
  {
    title: "Figma plugin",
    body: "Variables, modes, and styles synced from the same config. The canvas and the codebase finally agree.",
  },
  {
    title: "npm package",
    body: "CSS tokens and accessible components built on headless primitives, ready to drop into production.",
  },
];

export function FeatureTrio() {
  return (
    <section className="section feature-trio" id="features">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Why it works</p>
          <h2 className="section-title">Order isn’t a cleanup. It’s a system.</h2>
          <p className="section-sub">
            UI Organized keeps your components, tokens, and design files generated
            from one theme config — so things never get the chance to pile up again.
          </p>
        </Reveal>

        <div className="feature-trio__grid">
          {FEATURES.map((feature) => (
            <Reveal key={feature.title} className="feature-trio__cell">
              <Card variant="outlined" padding="lg" className="feature-trio__card">
                <span className="feature-trio__accent" aria-hidden="true" />
                <CardBody>
                  <h3 className="feature-trio__title">{feature.title}</h3>
                  <p className="feature-trio__body">{feature.body}</p>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
