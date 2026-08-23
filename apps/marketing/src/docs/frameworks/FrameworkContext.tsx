/**
 * The selected framework, for the whole docs subtree.
 *
 * Context rather than per-page state so the choice survives navigating between
 * components — a reader working in Vue should not have to re-pick Vue on every
 * page — and so the switcher and the code blocks can sit in different parts of
 * the tree without prop-drilling through the layout.
 *
 * Precedence and persistence live in `frameworkState.ts`, which is testable
 * without a DOM. This file is only the wiring.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import type { DocFramework } from "@ui-organized/code-connect/browser";
import {
  DEFAULT_FRAMEWORK,
  FRAMEWORK_PARAM,
  readStoredFramework,
  resolveFramework,
  withFramework,
  writeStoredFramework,
} from "./frameworkState";

interface FrameworkContextValue {
  framework: DocFramework;
  setFramework: (framework: DocFramework) => void;
}

const FrameworkContext = createContext<FrameworkContextValue>({
  framework: DEFAULT_FRAMEWORK,
  setFramework: () => {},
});

export function DocsFrameworkProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const param = params.get(FRAMEWORK_PARAM);
  const framework = resolveFramework(param, readStoredFramework());

  // Arriving on `?framework=vue` makes Vue this browser's preference, so
  // clicking through from a shared link keeps showing Vue. Without it the next
  // page silently reverts to whatever was stored, and the link looks broken.
  useEffect(() => {
    writeStoredFramework(framework);
  }, [framework]);

  const setFramework = useCallback(
    (next: DocFramework) => {
      writeStoredFramework(next);
      // `replace`, because switching framework is not a place in history you
      // want the back button to walk through one tab at a time.
      setParams(withFramework(params, next), { replace: true });
    },
    [params, setParams],
  );

  const value = useMemo(() => ({ framework, setFramework }), [framework, setFramework]);

  return <FrameworkContext.Provider value={value}>{children}</FrameworkContext.Provider>;
}

export function useDocsFramework(): FrameworkContextValue {
  return useContext(FrameworkContext);
}
