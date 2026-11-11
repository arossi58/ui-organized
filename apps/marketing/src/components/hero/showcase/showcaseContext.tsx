import { createContext, useContext, useState, type ReactNode } from "react";
import type { DocFramework } from "@ui-organized/code-connect/browser";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { PartHost } from "./partHost";
import type { ShowcasePage } from "./parts";

/**
 * The mockup's state, shared by the three things that draw it: the live
 * mockup, the physics pieces, and the hero that hands one off to the other.
 * Held above all three so the pieces always show what the visitor left the
 * mockup showing — the page, the framework tab, the sidebar — and so the hero
 * can switch the Code view off before the mockup comes apart.
 */
export interface ShowcaseState {
  page: ShowcasePage;
  setPage: (page: ShowcasePage) => void;
  framework: DocFramework;
  setFramework: (framework: DocFramework) => void;
  code: boolean;
  setCode: (code: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Phones: the sidebar is the icon rail and the window reflows. */
  narrow: boolean;
  host: PartHost;
}

const ShowcaseContext = createContext<ShowcaseState | null>(null);

export function ShowcaseProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<ShowcasePage>("dashboard");
  const [framework, setFramework] = useState<DocFramework>("react");
  const [code, setCode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const narrow = useMediaQuery("(max-width: 720px)");
  const [host] = useState(() => new PartHost());

  return (
    <ShowcaseContext.Provider
      value={{
        page,
        setPage,
        framework,
        setFramework,
        code,
        setCode,
        collapsed,
        setCollapsed,
        narrow,
        host,
      }}
    >
      {children}
    </ShowcaseContext.Provider>
  );
}

export function useShowcase(): ShowcaseState {
  const state = useContext(ShowcaseContext);
  if (!state) throw new Error("useShowcase must be used inside <ShowcaseProvider>");
  return state;
}
