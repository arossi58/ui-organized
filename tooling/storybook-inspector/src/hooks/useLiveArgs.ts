/**
 * Live args (INSPECTOR.md §5). Thin wrapper over Storybook's real `useArgs` — every
 * write goes through Storybook's own channel to the preview iframe, which re-renders
 * the REAL component with the REAL prop change. No simulation layer.
 */
import { useArgs } from "storybook/manager-api";

export function useLiveArgs(): {
  args: Record<string, unknown>;
  setArg: (name: string, value: unknown) => void;
  reset: () => void;
} {
  const [args, updateArgs, resetArgs] = useArgs();
  return {
    // `args` can be undefined before a story's args are ready (e.g. on first render
    // or a docs view) — default to {} so row reads never throw.
    args: (args ?? {}) as Record<string, unknown>,
    setArg: (name, value) => updateArgs({ [name]: value }),
    reset: () => resetArgs(),
  };
}
