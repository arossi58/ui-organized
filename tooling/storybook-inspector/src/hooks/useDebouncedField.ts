/**
 * Debounced field state (INSPECTOR.md §4/§5): text/number typing commits through
 * Storybook's args at most once per `delay`, so the live preview doesn't re-render
 * on every keystroke — but a step or blur commits immediately. Keeps local input
 * responsive while the external arg value is the source of truth.
 */
import { useEffect, useRef, useState } from "react";

export function useDebouncedField(
  external: string,
  commit: (v: string) => void,
  delay = 300,
): {
  value: string;
  setValue: (v: string) => void;
  flush: () => void;
  commitNow: (v: string) => void;
} {
  const [value, setLocal] = useState(external);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editing = useRef(false);

  // Adopt external changes only when the user isn't mid-edit (avoids clobbering).
  useEffect(() => {
    if (!editing.current) setLocal(external);
  }, [external]);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const setValue = (v: string) => {
    editing.current = true;
    setLocal(v);
    clear();
    timer.current = setTimeout(() => {
      editing.current = false;
      commit(v);
    }, delay);
  };

  const flush = () => {
    clear();
    editing.current = false;
    commit(value);
  };

  const commitNow = (v: string) => {
    clear();
    editing.current = false;
    setLocal(v);
    commit(v);
  };

  useEffect(() => clear, []);

  return { value, setValue, flush, commitNow };
}
