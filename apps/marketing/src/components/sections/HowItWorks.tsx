import { Badge } from "@ui-organized/react";
import { Reveal } from "../Reveal";
import "./how-it-works.css";

interface Step {
  label: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    label: "01",
    title: "Pick a brand color",
    body: "Choose one brand color and a neutral. The builder derives the full palette, type scale, spacing, and radii — light and dark.",
  },
  {
    label: "02",
    title: "Sync to Figma",
    body: "The plugin pushes the same config as Figma variables, modes, and styles, so design and code stay in lockstep.",
  },
  {
    label: "03",
    title: "Install the package",
    body: "Pull in the tokens and accessible components from npm and ship — the production UI matches the canvas exactly.",
  },
];

export function HowItWorks() {
  return (
    <section className="section how-it-works">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="section-title">One config. Three surfaces.</h2>
          <p className="section-sub">
            <Badge variant="info" size="sm">
              theme.config.ts
            </Badge>{" "}
            is the single source of truth — everything downstream is generated from it.
          </p>
        </Reveal>

        <div className="how-it-works__steps">
          {STEPS.map((step) => (
            <Reveal key={step.label} className="how-it-works__cell">
              <div className="how-it-works__step">
                <span className="how-it-works__num">{step.label}</span>
                <h3 className="how-it-works__title">{step.title}</h3>
                <p className="how-it-works__body">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
