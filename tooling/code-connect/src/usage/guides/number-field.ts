import type { UsageGuide } from "../types.js";

export const numberFieldUsage: UsageGuide = {
  slug: "number-field",
  codeName: "NumberField",
  summary:
    "A field for a number, with steppers and bounds. It accepts typing for a value someone already knows, and nudging for a value they are feeling their way toward.",
  useWhen: [
    "The value is a number where the exact figure matters.",
    "There are sensible bounds or a step the field can enforce.",
    "Small adjustments are common enough to be worth a control.",
  ],
  avoid: [
    {
      text: "For a rough setting where the exact number doesn't matter.",
      instead: ["range"],
    },
    {
      text: "For a number that is really an identifier, which has no order or arithmetic.",
      instead: ["input"],
    },
    {
      text: "For a choice between a few fixed amounts.",
      instead: ["select", "radio-group"],
    },
  ],
  guidance: [
    {
      do: "Set `min`, `max` and `step` to what the value can really be.",
      dont: "Leave the field unbounded and validate the impossible value after submit.",
      example: "bounds",
    },
    {
      do: "Say the unit in the label or through `format`, so the number is never ambiguous.",
      dont: "Show a bare number and leave the reader to guess minutes, hours or days.",
      example: "units",
    },
    {
      do: "Keep typing available alongside the steppers, for values far from the default.",
      dont: "Force forty presses on someone who knows the number they want.",
    },
  ],
  accessibility: [
    "The steppers are real buttons, and the arrow keys move the value for anyone on a keyboard.",
    "Bounds are exposed to assistive technology, so state them in the label too rather than only enforcing them.",
    "Announce a rejected value where it happened: silently clamping leaves the reader with a number they didn't choose.",
  ],
  content: [
    "Put the unit in the label: Retention in days, not Retention.",
    "Say the range in helper text when it isn't obvious from the value.",
  ],
  related: [
    { slug: "range", when: "the approximate position matters more than the exact number." },
    { slug: "input", when: "the digits are an identifier rather than a quantity." },
  ],
};
