import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useDeferred } from "./useDeferred.js";

/**
 * The one piece of this package with no React counterpart to copy.
 *
 * `useDeferredValue` is a React scheduler primitive; Vue has nothing like it, so
 * `useDeferred` is written rather than ported — and the three properties it has
 * to have are the ones the React adapter's comments say the table depends on.
 */
describe("useDeferred", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    vi.useFakeTimers();
    scope = effectScope();
  });
  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
  });

  /** Runs the body inside a scope, so `onScopeDispose` has somewhere to register. */
  const inScope = <T,>(body: () => T): T => scope.run(body)!;

  it("starts equal to its source, without waiting for a scheduler", () => {
    // The property a table seeded with `defaultFilters` depends on: it has to
    // render filtered on its very first pass, including on the server where
    // nothing is ever scheduled.
    const source = ref("seed");
    const deferred = inScope(() => useDeferred(() => source.value));
    expect(deferred.value).toBe("seed");
  });

  it("lags the source, then catches up", async () => {
    const source = ref("a");
    const deferred = inScope(() => useDeferred(() => source.value));

    source.value = "ab";
    await nextTick();
    // The whole point: the source moved and the deferred copy has not, so a
    // control bound to the source is already showing "ab" while the expensive
    // pass driven by the copy has not run.
    expect(source.value).toBe("ab");
    expect(deferred.value).toBe("a");

    await vi.runAllTimersAsync();
    expect(deferred.value).toBe("ab");
  });

  it("coalesces a burst into one update", async () => {
    const source = ref("");
    const deferred = inScope(() => useDeferred(() => source.value));
    const seen: string[] = [];

    for (const value of ["a", "ad", "ada"]) {
      source.value = value;
      await nextTick();
      seen.push(deferred.value);
    }
    // Nothing has landed yet — three keystrokes, no filter passes.
    expect(seen).toEqual(["", "", ""]);

    await vi.runAllTimersAsync();
    // And the one that does land is the last value, not an intermediate. This is
    // the case `useDataTable.ts` records breaking in React when the split was
    // written the obvious way: typing "ada" landed as "a".
    expect(deferred.value).toBe("ada");
  });

  it("stops scheduling when its scope is disposed", async () => {
    const source = ref("a");
    const deferred = inScope(() => useDeferred(() => source.value));

    source.value = "b";
    await nextTick();
    scope.stop();
    await vi.runAllTimersAsync();

    // A pending task that fired after teardown would write to a ref nobody owns
    // any more — harmless here, and a leak in a table that is unmounted while
    // someone is typing in it.
    expect(deferred.value).toBe("a");
  });
});
