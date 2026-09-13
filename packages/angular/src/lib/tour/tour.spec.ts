import { describe, it, expect } from "vitest";
import { effectiveTourSteps, normalizeTourStep, tourProgressText, type TourStep } from "./tour.js";

/**
 * The step normaliser and the counter, against what a running `@ark-ui/react`
 * Tour actually rendered.
 *
 * Both are small and both are surprising, which is why they are asserted here
 * rather than left to the browser cases. The normaliser's branches are tested in
 * the order zag writes them — `target == null` before the type — and the
 * consequence is a `wait` step that picks up `backdrop: true` from the *dialog*
 * branch and renders an un-hidden backdrop. The counter takes both its halves
 * from the effective steps, so the same step reads "0 of 1" while the Next
 * button beside it is enabled, because the buttons count everything.
 *
 * The expected values are the ones read out of the DOM the React component
 * produced in the parity harness — see `browser/scenarios/Tour.ts`.
 */
const step = (over: Partial<TourStep> = {}): TourStep => ({
  id: "one",
  title: "One",
  description: "First step",
  ...over,
});

describe("normalizeTourStep", () => {
  it("makes a step with no target a dialog that dims the page", () => {
    expect(normalizeTourStep(step())).toEqual({
      id: "one",
      title: "One",
      description: "First step",
      type: "dialog",
      placement: "center",
      backdrop: true,
    });
  });

  /**
   * The branch order is the point. A `wait` step with no target is matched by
   * `target == null` *before* its type is looked at, so it comes back with
   * `backdrop: true` from a branch it does not belong to — and keeps its own
   * type, because the spread comes last.
   */
  it("gives a waiting step the dialog branch's backdrop and its own type", () => {
    const normalized = normalizeTourStep(step({ type: "wait" }));
    expect(normalized.type).toBe("wait");
    expect(normalized.backdrop).toBe(true);
  });

  it("leaves a caller's own backdrop alone", () => {
    expect(normalizeTourStep(step({ backdrop: false })).backdrop).toBe(false);
  });

  it("gives a targeted tooltip step an arrow, and a dialog none", () => {
    const target = () => null;
    expect(normalizeTourStep({ ...step(), target, type: "tooltip" }).arrow).toBe(true);
    expect(normalizeTourStep({ ...step(), target, type: "dialog" }).arrow).toBe(undefined);
    // A tooltip step with no target falls into the dialog branch first, so it
    // gets no arrow — which is why the browser cases never see one.
    expect(normalizeTourStep(step({ type: "tooltip" })).arrow).toBe(undefined);
  });

  it("makes a floating step undimmed and unpointed", () => {
    expect(normalizeTourStep(step({ type: "floating" }))).toMatchObject({
      type: "floating",
      backdrop: false,
      arrow: false,
      placement: "bottom-end",
    });
  });
});

describe("effectiveTourSteps", () => {
  it("drops the waiting steps, which are pauses rather than cards", () => {
    const steps = [step({ id: "a" }), step({ id: "b", type: "wait" }), step({ id: "c" })];
    expect(effectiveTourSteps(steps).map((s) => s.id)).toEqual(["a", "c"]);
  });
});

describe("tourProgressText", () => {
  const steps = [step({ id: "one" }), step({ id: "two" }), step({ id: "three" })];

  it("counts from one", () => {
    expect(tourProgressText(steps, "one")).toBe("1 of 3");
    expect(tourProgressText(steps, "two")).toBe("2 of 3");
    expect(tourProgressText(steps, "three")).toBe("3 of 3");
  });

  it("reads zero before a tour has a step, and for an id that names none", () => {
    expect(tourProgressText(steps, null)).toBe("0 of 3");
    expect(tourProgressText(steps, "nope")).toBe("0 of 3");
  });

  /**
   * The disagreement worth pinning: a waiting step is not counted and is not
   * found among the ones that are, so its own tour reads "0 of 1" — while the
   * Next button beside it is enabled, because `hasNextStep` counts every step.
   */
  it("does not count a waiting step, or find one", () => {
    const waiting = [step({ id: "one", type: "wait" }), step({ id: "two" })];
    expect(tourProgressText(waiting, "one")).toBe("0 of 1");
    expect(tourProgressText(waiting, "two")).toBe("1 of 1");
  });
});
