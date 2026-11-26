/**
 * Shiki for a docs code block, loaded on first use. Until it lands the block
 * renders plain text, and every block on the page shares the one load.
 */
import { useEffect, useState } from "react";
import type { CodeHighlighter } from "@ui-organized/react";

type HighlightModule = typeof import("../highlight");

let loaded: HighlightModule | undefined;
let loading: Promise<HighlightModule> | undefined;

export function useHighlighter(language?: string): CodeHighlighter | undefined {
  const [module, setModule] = useState(loaded);

  useEffect(() => {
    if (module) return;
    let live = true;
    loading ??= import("../highlight").then((m) => (loaded = m));
    void loading.then((m) => {
      if (live) setModule(m);
    });
    return () => {
      live = false;
    };
  }, [module]);

  return module?.highlighterFor(language);
}
