import { getContext, setContext } from "svelte";

const KEY = Symbol("chip");

/** The chip's `disabled`, reaching segments a consumer composed themselves. */
export function provideChipDisabled(read: () => boolean): void {
  setContext(KEY, read);
}

/** Call during component init; the returned reader is safe inside `$derived`. */
export function readChipDisabled(): () => boolean {
  const read = getContext<(() => boolean) | undefined>(KEY);
  return () => read?.() ?? false;
}
