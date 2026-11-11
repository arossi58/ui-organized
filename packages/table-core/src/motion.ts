/**
 * Waiting for the filter row to finish arriving.
 *
 * The first filter mounts the row under the toolbar, and the row animates its
 * height open (`data-table-row-in`, toolbar.css). The chip inside it is the
 * anchor for the value editor, and the header opens that editor the moment it
 * adds the condition — so a popover opened straight away is positioned against
 * a chip that is still sliding, and snaps to its real place when the row
 * settles. Holding the popover back until the row's animation ends means it
 * appears once, where it belongs.
 *
 * When nothing is animating — the row was already there, or the browser has no
 * Web Animations API (jsdom) — `run` is called synchronously, so opening an
 * existing chip's editor is not delayed at all.
 */

const ROW = ".data-table__subbar";

/**
 * Call `run` once the filter row containing `element` has finished its entrance
 * animation. Returns a cancel function, for when the editor stops being wanted
 * before the row settles.
 */
export function afterRowEntrance(element: Element | null, run: () => void): () => void {
  const row = element?.closest(ROW);
  const running = row?.getAnimations?.().filter((animation) => animation.playState !== "finished") ?? [];
  if (running.length === 0) {
    run();
    return () => {};
  }
  let cancelled = false;
  let frame = 0;
  // A cancelled animation rejects `finished`; the row is in place either way.
  void Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(() => {
    // `finished` settles mid-frame, after layout; opening there paints the
    // popover one frame at the page origin before it is positioned. The next
    // frame opens it like a click would.
    if (!cancelled) frame = requestAnimationFrame(run);
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
