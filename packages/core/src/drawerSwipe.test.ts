import { describe, expect, it } from "vitest";
import {
  DRAWER_SWIPE,
  drawerDragOffset,
  drawerDragStarted,
  drawerReleaseVelocity,
  drawerShouldDismiss,
  drawerSwipeProgress,
  drawerSwipeStrength,
} from "./drawerSwipe.js";

describe("drawerDragOffset", () => {
  it("follows the pointer down", () => {
    expect(drawerDragOffset(100, 160)).toBe(60);
    expect(drawerDragOffset(100, 100)).toBe(0);
  });
  it("rubber-bands an upward drag to its square root", () => {
    expect(drawerDragOffset(100, 0)).toBe(-10);
    expect(drawerDragOffset(100, 96)).toBe(-2);
  });
});

describe("drawerReleaseVelocity", () => {
  it("measures the last moments of a moving pointer", () => {
    const samples = [
      { y: 0, time: 0 },
      { y: 10, time: 100 },
      { y: 30, time: 150 },
      { y: 60, time: 200 },
    ];
    // The window is the last 100ms: from y 10 at 100ms to y 60 at 200ms.
    expect(drawerReleaseVelocity(samples, 210)).toBe(500);
  });
  it("falls back to the whole gesture once the pointer had stopped", () => {
    const samples = [
      { y: 0, time: 0 },
      { y: 100, time: 200 },
    ];
    expect(drawerReleaseVelocity(samples, 400)).toBe(500);
  });
  it("is zero without movement to measure", () => {
    expect(drawerReleaseVelocity([], 0)).toBe(0);
    expect(drawerReleaseVelocity([{ y: 5, time: 0 }], 10)).toBe(0);
  });
  it("is negative for an upward flick", () => {
    expect(
      drawerReleaseVelocity(
        [
          { y: 100, time: 0 },
          { y: 50, time: 50 },
        ],
        60,
      ),
    ).toBe(-1000);
  });
});

describe("drawerShouldDismiss", () => {
  it("closes past half the drawer, and snaps back short of it", () => {
    expect(drawerShouldDismiss(201, 0, 400)).toBe(true);
    expect(drawerShouldDismiss(199, 0, 400)).toBe(false);
  });
  it("lets a downward fling close a short drag", () => {
    // 80px down at 1000px/s carries 400px further: past halfway.
    expect(drawerShouldDismiss(80, 1000, 400)).toBe(true);
    expect(drawerShouldDismiss(80, DRAWER_SWIPE.snapVelocity - 1, 400)).toBe(false);
  });
  it("lets the position, not an upward flick, decide a long drag", () => {
    // zag's rule, so Angular agrees with Ark: past 24px of displacement, a
    // velocity pointing back is the pointer settling and counts for nothing.
    expect(drawerShouldDismiss(220, -1000, 400)).toBe(true);
    expect(drawerShouldDismiss(180, -1000, 400)).toBe(false);
  });
  it("lets an upward flick carry a short drag back open", () => {
    expect(drawerShouldDismiss(20, -1000, 40)).toBe(false);
  });
  it("ignores a velocity against a large displacement", () => {
    // Settling upward after a 300px drag is not a fling back open.
    expect(drawerShouldDismiss(300, -100, 400)).toBe(true);
  });
  it("is closed once dragged past its own height", () => {
    expect(drawerShouldDismiss(400, -4000, 400)).toBe(true);
  });
  it("never closes a drawer it could not measure", () => {
    expect(drawerShouldDismiss(500, 0, 0)).toBe(false);
  });
});

describe("drawerSwipeStrength", () => {
  it("is full for a slow release or none", () => {
    expect(drawerSwipeStrength(100, 400, 0)).toBe(1);
    expect(drawerSwipeStrength(400, 400, 1000)).toBe(1);
  });
  it("shortens the animation for a fling", () => {
    // 300px left at 3000px/s is 100ms of a 360ms scale.
    expect(drawerSwipeStrength(100, 400, 3000)).toBeCloseTo(0.1 + (100 / 360) * 0.9, 5);
    expect(drawerSwipeStrength(399, 400, 4000)).toBeCloseTo(0.1, 2);
  });
});

describe("drawerSwipeProgress", () => {
  it("is the share of the height dragged", () => {
    expect(drawerSwipeProgress(100, 400)).toBe(0.25);
    expect(drawerSwipeProgress(800, 400)).toBe(1);
    expect(drawerSwipeProgress(50, 0)).toBe(0);
  });
});

describe("drawerDragStarted", () => {
  it("starts once the pointer has clearly moved along the axis", () => {
    expect(drawerDragStarted(0, 6)).toBe(true);
    expect(drawerDragStarted(0, -8)).toBe(true);
    expect(drawerDragStarted(0, 5)).toBe(false);
  });
  it("waits while the movement is as much across as along", () => {
    expect(drawerDragStarted(6, 7)).toBe(false);
    expect(drawerDragStarted(4, 7)).toBe(true);
  });
});
